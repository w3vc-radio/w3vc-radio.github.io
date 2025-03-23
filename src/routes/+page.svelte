<script>
	import { derived, get } from 'svelte/store';
	import { crossfade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { press, setPointerControls, tap } from 'svelte-gestures';
	import { localStore } from '../useLocalStorage.svelte';
	import Stop from '../stop.svelte';
	import StopCard from '../stopCard.svelte';
	import DataTab from '../dataTab.svelte';
	import SettingsTab from '../settingsTab.svelte';
	import Fa from 'svelte-fa';
	import {
		faGear,
		faHome,
		faInbox,
		faPerson,
		faUser,
		faUserPen
	} from '@fortawesome/free-solid-svg-icons';
	import OperatorsTab from '../operatorsTab.svelte';

	const [send, receive] = crossfade({});
	let store = localStore('buggy', []);
	let config = localStore('config', {
		stations: [],
		teams: [],
		operators: [],
		theme: 'dark',
		showImages: false,
		nextIDRoundTime: new Date().toUTCString(),
		startTime: new Date().toUTCString()
	});
	let selectedTheme = $state(config.value.theme);
	let currentTab = $state(1);
	let stopModal = $state();
	let currentRoundState = $state(0); // 0 - Not active, 1- Round ongoing, 2 - Paused, 3- Stopped, 4 - clear
	let undoList = $state([]);
	let nextIDRoundTime = $derived(new Date(config.value.nextIDRoundTime));
	let startTime = $derived(new Date(config.value.startTime));
	let startTimerIntervalId = 0;
	let timeSinceRoundStart = $state(0);
	let idHidden = $state(true);
	let showData = $state(false);
	let confirmClear = $state(false);
	let clipboardSubmitted = $state(false);
	let clipboardError = $state(false);
	let exportSubmitted = $state(false);
	let exportError = $state(false);
	let activeRollInfo = $state(
		config.value.stations.map((name) => {
			return { name: name, buggies: [], followCarSeen: false };
		})
	);
	let activeRollStopAndPauseNotes = $state([]);
	let stationsDidId = $state(config.value.stations.map(() => false));
	let shouldID = $state(false);
	let teams = $derived(config.value.teams);
	let flipHandedness = $derived(config.value.handedness);
	let stopBtnHeld = $state(false);
	let undoBtnHeld = $state(false);
	let stops = $state([]);
	let teamSelectOpen = $state(false);
	let stopBtnWasHeld = $state(false);
	let canExport = $derived(config.value.exportPassword != '');

	let team = $state(config.value.teams.length > 0 ? config.value.teams[0] : 'N/A');

	let resetConfig = () => {
		config.update();
	};

	let handlePrimaryOperatorIdUpates = (station) => {
		return (newTime) => {
			config.value.operators = config.value.operators.map((o) => {
				if (o.station == station && o.isPrimary) {
					o.lastId = newTime;
				}
				return o;
			});
		};
	};

	let startTimer = () => {
		const intervalId = setInterval(() => {
			timeSinceRoundStart = new Date() - startTime;
		}, 1000);

		startTimerIntervalId = intervalId;
	};

	let startIDRound = () => {
		let currentTime = new Date();
		config.value.nextIDRoundTime = new Date(currentTime.getTime() + 10 * 60000).toUTCString();
		idHidden = !idHidden;
	};

	let saveDateAndReset = (shouldSave) => {
		clearInterval(startTimerIntervalId);
		timeSinceRoundStart = 0;
		let data = {
			buggies: $state.snapshot(activeRollInfo),
			team: $state.snapshot(team),
			startTime: $state.snapshot(startTime),
			notes: $state.snapshot(activeRollStopAndPauseNotes),
			didId: false
		};

		data.operators = config.value.stations.map(
			(station) =>
				config.value.operators.find((op) => op.station == station && op.isPrimary).callsign
		);

		stationsDidId.forEach((t) => {
			if (t) {
				data.didId = true;
			}
		});

		if (shouldSave) {
			team = teams[(teams.indexOf(team) + 1) % teams.length];
			let prevData = $state.snapshot(store.value);
			prevData.push(data);
			store.value = prevData;
		}

		activeRollInfo = config.value.stations.map((name) => {
			return { name: name, buggies: [], followCarSeen: false };
		});
		stationsDidId = config.value.stations.map(() => false);
		activeRollStopAndPauseNotes = [];
	};

	async function writeClipboard() {
		try {
			await navigator.clipboard.writeText(JSON.stringify($state.snapshot(store.value), null, 4));
			clipboardSubmitted = true;
			clipboardError = false;
		} catch (error) {
			console.error(error.message);
			clipboardSubmitted = true;
			clipboardError = true;
			const intervalId = setInterval(() => {
				clipboardSubmitted = false;
				clipboardError = false;
			}, 1500); // 60000 milliseconds = 1 minute
		}
	}

	function tapOrPress(node, parameters = { timeframe: 300 }) {
		const gestureName = 'tapOrPress';
		const spread = 20;

		let pressed = false;
		let x;
		let y;
		let timeout;
		let currentlyHeldState = false;

		function dispatchHeldState(newState) {
			node.dispatchEvent(
				new CustomEvent(gestureName, {
					detail: { newState: newState }
				})
			);
		}

		function onUp(activeEvents, event) {
			clearTimeout(timeout);
			if (pressed) {
				parameters.handler(currentlyHeldState);
			}
			pressed = false;
			currentlyHeldState = false;
		}

		function onMove(activeEvents, event) {
			if (pressed) {
				if (x * x + y * y >= spread) {
					pressed = false;
				}
			}
			return false;
		}

		function onDown(activeEvents, event) {
			if (!pressed) {
				pressed = true;
				x = event.clientX;
				y = event.clientY;
			}
			timeout = setTimeout(() => {
				currentlyHeldState = true;
				dispatchHeldState(true);
			}, parameters.timeframe);
		}

		return setPointerControls(gestureName, node, onMove, onDown, onUp);
	}

	let undoBtnHandler = (btnHeld) => {
		if (!btnHeld) {
			undoList.length > 0 ? stops[undoList.pop()].removeLastBuggy() : console.log('empty');
		} else {
			saveDateAndReset(false);
		}
		undoBtnHeld = false;
	};

	let stopBtnHandler = (event) => {
		let newItem = {
			stopOrPause: !stopBtnHeld,
			time: new Date().toUTCString(),
			info: ''
		};
		activeRollStopAndPauseNotes.push(newItem);
		stopModal.showModal();
	};

	let formatTime = (startTime, buggy, buggies) => {
		if (buggy.number == '1' || buggy.number == 'F') {
			let diff = new Date(buggy.time) - startTime;
			let seconds = Math.ceil(diff / 1000) % 60;
			let minutes = Math.floor(Math.max(diff / 1000 - seconds, 0) / 60);
			return `@${minutes}:${String(seconds).padStart(2, '0')}`;
		} else {
			let prevBuggy = buggies[buggies.indexOf(buggy) - 1];
			let diff = new Date(buggy.time) - new Date(prevBuggy.time);
			let seconds = (diff / 1000) % 60;
			let minutes = Math.floor(Math.max(diff / 1000 - seconds, 0) / 60);
			return `+${minutes}:${String(Math.floor(seconds)).padStart(2, '0')}`;
		}
	};

	let exportData = async () => {
		let rows = [];

		let configHeaderRow = [['Position', 'Call', 'Name']];
		let configRows = configHeaderRow.concat(
			config.value['operators'].map((operator) => [
				operator.station + (operator.isPrimary ? ' (Primary)' : ''),
				operator.callsign,
				operator.name
			])
		);
		let buggyDataHeaderRow = [['Buggy'].concat(config.value.stations)];
		let emptyBuggyCols = config.value.stations.map(() => '');

		let buggyRows = store.value.reduce((prev, roll) => {
			let buggyInfoRow = [[new Date(roll.startTime).toLocaleTimeString(), '@', roll.team]];
			let operatorRow = ['Operators'].concat(roll.operators);
			let buggyDataRows = roll.buggies[0].buggies.map((d) => [d.number].concat(emptyBuggyCols));
			roll.buggies.forEach((stationData, idx) => {
				let first_buggy_time = new Date(stationData.buggies[0].time);
				stationData.buggies.forEach((buggy, b_idx) => {
					buggyDataRows[b_idx][idx + 1] = formatTime(
						new Date(roll.startTime),
						buggy,
						stationData.buggies
					);
				});
			});
			roll.notes.forEach((note, idx) => {
				if (idx == 0) {
					buggyDataRows[0].push('Notes');
				}
				buggyDataRows[0].push(
					(note.stopOrPause ? 'Stop' : 'Pause') + ' at ' + new Date(note.time).toLocaleString()
				);
				buggyDataRows[1].push(note.info);
			});
			return prev.concat(
				buggyInfoRow.concat(operatorRow).concat(buggyDataHeaderRow).concat(buggyDataRows)
			);
		}, []);

		let today = new Date();
		let postData = {
			data: configRows.concat([[]].concat(buggyRows)),
			sheetId: 'Rolls ' + (today.getMonth() + 1).toString() + '_' + today.getDate().toString()
		};

		try {
			const response = await fetch('https://buggyapp.kandasamyc.com/updateData', {
				method: 'POST',
				headers: {
					'Auth-Code': config.value.exportPassword
				},
				body: JSON.stringify(postData)
			});
			if (!response.ok) {
				exportSubmitted = true;
				exportError = true;
			} else {
				exportSubmitted = true;
				exportError = false;
			}
		} catch (_) {
			exportSubmitted = true;
			exportError = true;
		}
		setTimeout(() => {
			exportSubmitted = false;
		}, 3000);
	};

	let formatMinutesAndSeconds = (diff) => {
		let seconds = Math.ceil(diff / 1000) % 60;
		let minutes = Math.floor(Math.max(diff / 1000 - seconds, 0) / 60);
		return `${minutes}:${String(seconds).padStart(2, '0')}`;
	};
</script>

<input
	type="radio"
	name="theme-dropdown"
	class="theme-controller btn btn-sm btn-block btn-ghost hidden w-full justify-start"
	aria-label={selectedTheme}
	value={selectedTheme}
	checked
/>

<div class="h-svh w-full px-2 py-2">
	<div class="grid h-full grid-flow-col grid-rows-12 gap-0 text-2xl">
		<div id="header-row" class="row-span-1 grid grid-flow-col grid-cols-3 grid-rows-4 gap-x-3">
			<select
				class="bg-base-300 form-select col-span-1 row-span-4 h-full w-full rounded-md border-0 text-lg"
				bind:value={team}
			>
				{#each teams as t}
					<option class="p-1 text-sm" value={t}>{t} </option>
				{/each}
			</select>
			<p class="col-span-1 col-start-2 row-span-2 row-start-2 text-center text-xl">
				Round Timer: {formatMinutesAndSeconds(timeSinceRoundStart)}
			</p>
			<div class="col-span-1 col-start-3 row-span-4 mr-2">
				<button
					use:tapOrPress={{ handler: undoBtnHandler, timeframe: 300 }}
					ontapOrPress={(event) => {
						undoBtnHeld = event.detail.newState;
					}}
					class="btn h-full w-full touch-manipulation text-lg"
					class:btn-secondary={!undoBtnHeld}
					class:btn-error={undoBtnHeld}>{!undoBtnHeld ? 'Undo' : 'Clear'}</button
				>
			</div>
		</div>
		<div
			id="content-row"
			class="flex flex-col overflow-y-auto py-3 {currentTab == 0 || currentTab == 3
				? 'row-span-10'
				: 'row-span-8'}"
		>
			{#if currentTab == 2}
				<DataTab bind:exportError bind:exportSubmitted />
			{:else if currentTab == 1}
				<!-- else content here -->

				{#each activeRollInfo as round, i}
					<Stop
						name={config.value.stations[i]}
						bind:buggies={round.buggies}
						{idHidden}
						maxBuggies={currentRoundState != 0
							? i == 0
								? 6
								: activeRollInfo[i - 1].buggies.length
							: 0}
						{startTime}
						bind:followRecorded={round.followCarSeen}
						prevFollowRecorded={currentRoundState != 0
							? i > 0
								? activeRollInfo[i - 1].followCarSeen
								: true
							: false}
						bind:didID={stationsDidId[i]}
						operatorLastIdUpdateFunc={handlePrimaryOperatorIdUpates(config.value.stations[i])}
						bind:this={stops[i]}
						bind:undoList
						idx={i}
						bind:config
					/>
				{/each}
			{:else if currentTab == 3}
				<OperatorsTab {config} buggy={store} />
			{:else}
				<SettingsTab {config} bind:selectedTheme />
			{/if}
		</div>
		<div
			id="settings-row"
			class="{currentTab == 0 || currentTab == 3
				? 'hidden'
				: 'row-span-2'} grid grid-flow-col grid-cols-3 gap-x-3"
		>
			{#if currentTab == 2}
				<!-- content here -->
				<button
					onclick={writeClipboard}
					class="btn {clipboardSubmitted
						? clipboardError
							? 'btn-error'
							: 'btn-success'
						: 'btn-secondary'} h-full text-xl">Copy Data To Clipboard</button
				>
				<button
					onclick={exportData}
					class:btn-disabled={!canExport}
					class="btn {exportSubmitted
						? exportError
							? 'btn-error'
							: 'btn-success'
						: 'btn-primary'} h-full text-xl">Export Data</button
				>

				<!-- content here -->
				{#if confirmClear}
					<!-- content here -->
					<button
						onclick={() => {
							confirmClear = false;
							store.value = [];
						}}
						class="btn btn-error h-full text-xl">Are you sure?</button
					>
				{:else}
					<button
						onclick={() => {
							confirmClear = true;
							setTimeout(() => (confirmClear = false), 2000);
						}}
						class="btn btn-warning h-full text-xl">Clear Data</button
					>
				{/if}
			{:else if currentTab == 1}
				<!-- else content here -->

				<button
					class="btn btn-warning h-full text-xl"
					class:btn-error={currentRoundState > 0 && !stopBtnHeld}
					class:btn-warning={currentRoundState > 0 && stopBtnHeld}
					class:btn-disabled={currentRoundState == 0}
					use:tapOrPress={{ timeframe: 300, handler: stopBtnHandler }}
					ontapOrPress={(wasHeld) => {
						stopBtnHeld = wasHeld;
					}}>Record {!stopBtnHeld ? 'Stop' : 'Pause'}</button
				>
				<!-- else content here -->
				<button
					onclick={() => {
						if (currentRoundState > 0) {
							saveDateAndReset(true);
						} else {
							config.value.startTime = new Date().toUTCString();
							startTimer();
						}
						currentRoundState = currentRoundState == 0 ? 1 : 0;
					}}
					class="btn h-full text-xl"
					class:btn-success={currentRoundState > 0}
					class:btn-primary={currentRoundState == 0}
					class:btn-disabled={currentRoundState > 0 &&
						!activeRollInfo[stops.length - 1].followCarSeen &&
						activeRollStopAndPauseNotes.length == 0}
				>
					{currentRoundState > 0 ? 'Mark Clear' : 'Start Round'}
				</button>
				<button onclick={startIDRound} disabled={showData} class="btn btn-secondary h-full text-xl"
					>{idHidden ? 'Enable' : 'Hide'} IDing</button
				>
			{/if}
		</div>
		<dialog class="modal" bind:this={stopModal}>
			<div class="modal-box">
				<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
					<legend class="fieldset-legend text-lg">Stop/Pause Notes</legend>
					{#each activeRollStopAndPauseNotes as note}
						<label id="org-select" class="fieldset-label text-base"
							>{note.stopOrPause ? 'Stop' : 'Pause'} at {new Date(
								note.time
							).toLocaleTimeString()}</label
						>
						<input type="text" class="input" bind:value={note.info} />
					{/each}
					<form method="dialog">
						<button
							class="btn btn-secondary btn-block"
							onclick={() => {
								stopBtnHeld = false;
							}}>Close</button
						>
					</form>
				</fieldset>
			</div>
		</dialog>
	</div>
	<div class="dock bg-base-300 max-h-1/11 pt-0.5">
		<button
			onclick={() => (currentTab = 0)}
			class="my-auto inline-flex items-center rounded-md text-xl"
			class:dock-active={currentTab == 0}
		>
			<Fa icon={faGear}></Fa>
			<span class="dock-label text-sm!">Settings</span>
		</button>
		<button
			onclick={() => (currentTab = 1)}
			class="my-auto inline-flex items-center rounded-md text-xl"
			class:dock-active={currentTab == 1}
		>
			<Fa icon={faHome}></Fa>
			<span class="dock-label text-sm!">Home</span>
		</button>

		<button
			onclick={() => (currentTab = 2)}
			class="my-auto inline-flex items-center rounded-md text-xl"
			class:dock-active={currentTab == 2}
		>
			<Fa icon={faInbox}></Fa>
			<span class="dock-label text-sm!">Data</span>
		</button>
		<button
			onclick={() => (currentTab = 3)}
			class="my-auto inline-flex items-center rounded-md text-xl"
			class:dock-active={currentTab == 3}
		>
			<Fa icon={faUser}></Fa>
			<span class="dock-label text-sm!">Operators</span>
		</button>
	</div>
</div>

<script>
	import { derived, get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { press, tap } from 'svelte-gestures';
	import useLocalStorage from '../useLocalStorage.svelte.js';
	import Stop from '../stop.svelte';
	import StopCard from '../stopCard.svelte';

	let store = useLocalStorage('buggy', []);
	let info = useLocalStorage('info', {
		lastID: new Date().toUTCString(),
		startTime: new Date().toUTCString()
	});
	let lastID = $derived(new Date(info.value.lastID));
	let startTime = $derived(new Date(info.value.startTime));
	let idHidden = $state(true);
	let showData = $state(false);
	let confirmClear = $state(false);
	let clipboardSubmitted = $state(false);
	let clipboardError = $state(false);
	let startBuggies = $state([]);
	let startedBuggies = $derived(startBuggies.length.valueOf());
	let startFollowRecorded = $state(false);
	let startID = $state(false);
	let pantherID = $state(false);
	let chuteID = $state(false);
	let pantherBuggies = $state([]);
	let pantherFollowRecorded = $state(false);
	let pantheredBuggies = $derived(pantherBuggies.length.valueOf());
	let chuteBuggies = $state([]);
	let chuteFollowRecorded = $state(false);
	let chutedBuggies = $derived(chuteBuggies.length.valueOf());
	let shouldID = $state(false);
	let teams = ['CIA', 'SDC', 'Apex', 'Spirit', 'Pike', 'Atlas', 'Fringe'];
	let teamSelectOpen = $state(false);
	let team = $state('CIA');
	let themes = [
		'default',
		'bumblebee',
		'cupcake',
		'retro',
		'garden',
		'lemonade',
		'coffee',
		'sunset'
	];

	let startIDRound = () => {
		idHidden = !idHidden;
	};

	let removeEntry = (i) => {
		let prevData = $state.snapshot(store.value);
		prevData.splice(prevData.length - 1 - i, 1);
		store.value = prevData;
	};

	onMount(() => {
		const intervalId = setInterval(() => {
			let currentTime = new Date();
			if ((currentTime - lastID) / 60000 > 10) {
				shouldID = true;
				idHidden = false;
			}
		}, 30000); // 60000 milliseconds = 1 minute

		return () => clearInterval(intervalId);
	});

	let saveDateAndReset = (shouldSave) => {
		let data = {
			startBuggies: $state.snapshot(startBuggies),
			chuteBuggies: $state.snapshot(chuteBuggies),
			pantherBuggies: $state.snapshot(pantherBuggies),
			team: $state.snapshot(team),
			startTime: $state.snapshot(startTime),
			didID: $state.snapshot(startID) && $state.snapshot(pantherID) && $state.snapshot(chuteID)
		};

		startBuggies = [];
		chuteBuggies = [];
		pantherBuggies = [];
		team = teams[(teams.indexOf(team) + 1) % teams.length];
		let currInfo = $state.snapshot(info.value);
		currInfo.lastID = data.didID ? currInfo.startTime : lastID;
		currInfo.startTime = new Date();
		if (data.didID) {
			shouldID = false;
			idHidden = true;
		}

		startID = false;
		pantherID = false;
		chuteID = false;

		info.value = currInfo;
		startFollowRecorded = false;
		pantherFollowRecorded = false;
		chuteFollowRecorded = false;

		if (shouldSave) {
			let prevData = $state.snapshot(store.value);
			prevData.push(data);
			store.value = prevData;
		}
	};

	let loadData = () => {
		let data = $state.snapshot(store.value);
		data.forEach((element) => {
			element.startTime = new Date(element.startTime);
			element.startBuggies.forEach((buggy) => (buggy.time = new Date(buggy.time)));
			element.pantherBuggies.forEach((buggy) => (buggy.time = new Date(buggy.time)));
			element.chuteBuggies.forEach((buggy) => (buggy.time = new Date(buggy.time)));
		});
		return data;
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
</script>

<div class=" h-svh w-full px-2 py-2">
	<div class="grid h-full grid-flow-col grid-rows-10 gap-0 text-2xl">
		<div id="header-row" class="row-span-1 grid grid-flow-col grid-cols-3 grid-rows-4 gap-x-2">
			<p class="col-span-1 col-start-2 row-span-2 row-start-1 text-center text-xl">
				Start: {startTime.getHours().toString().padStart(2, '0')}:{startTime
					.getMinutes()
					.toString()
					.padStart(2, '0')}
			</p>
			<p
				class="col-span-1 col-start-2 row-span-2 row-start-3 text-center text-xl"
				class:text-primary={shouldID}
			>
				Last ID: {lastID.getHours().toString().padStart(2, '0')}:{lastID
					.getMinutes()
					.toString()
					.padStart(2, '0')}
			</p>
			<div class="dropdown col-span-1 col-start-1 row-span-4 mb-72 h-full w-full">
				<div tabindex="0" role="button" class="btn h-full w-full bg-base-300">
					<span class="text-primary">{team}</span>
					<svg
						width="12px"
						height="12px"
						class="inline-block h-2 w-2 fill-current opacity-60"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 2048 2048"
					>
						<path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
					</svg>
				</div>
				<ul tabindex="0" class="dropdown-content z-[1] w-52 rounded-box bg-base-300 p-2 shadow-2xl">
					{#each teams as currTeam}
						<li>
							<input
								type="radio"
								name="team-dropdown"
								class="btn btn-ghost btn-sm btn-block justify-start"
								aria-label={currTeam}
								onclick={() => {
									team = currTeam;
									teamSelectOpen = false;
								}}
								value={currTeam}
							/>
						</li>
					{/each}
				</ul>
			</div>

			<div class="dropdown col-span-1 col-start-3 row-span-4 mb-72 h-full w-full">
				<div tabindex="0" role="button" class="btn h-full w-full bg-base-300">
					Theme
					<svg
						width="12px"
						height="12px"
						class="inline-block h-2 w-2 fill-current opacity-60"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 2048 2048"
					>
						<path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
					</svg>
				</div>
				<ul tabindex="0" class="dropdown-content z-[1] w-52 rounded-box bg-base-300 p-2 shadow-2xl">
					{#each themes as theme}
						<li>
							<input
								type="radio"
								name="theme-dropdown"
								class="theme-controller btn btn-ghost btn-sm btn-block justify-start"
								aria-label={theme}
								value={theme}
							/>
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<div id="timing-row" class="row-span-7 grid grid-flow-col grid-rows-3 gap-6 py-3">
			{#if showData}
				<div class="row-span-3 flex flex-col overflow-scroll">
					{#each loadData().reverse() as round, i}
						<!-- content here -->
						<div class="card my-2 flex flex-col bg-base-300 p-4">
							<div class="flex w-full flex-row justify-between">
								<p><span class="text-primary">Team</span>: {round.team}</p>
								<p>
									<span class="text-primary">At</span>: {round.startTime
										.getHours()
										.toString()
										.padStart(2, '0')}:{round.startTime.getMinutes().toString().padStart(2, '0')}
								</p>
								<p><span class="text-primary">ID?</span>: {round.didID ? 'Y' : 'N'}</p>
								<button
									onclick={() => removeEntry(i)}
									class="active:bg-warning-200 rounded-md bg-warning p-2 text-sm transition active:scale-[0.9]"
								>
									<svg
										class="h-3 w-3 fill-inherit"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 384 512"
										><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
											d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
										/></svg
									>
								</button>
							</div>
							<StopCard name={'Start'} buggies={round.startBuggies} />
							<StopCard name={'Panther'} buggies={round.pantherBuggies} />
							<StopCard name={'Chute'} buggies={round.chuteBuggies} />
						</div>
					{/each}
				</div>
			{:else}
				<!-- else content here -->
				<Stop
					name={'Start'}
					bind:buggies={startBuggies}
					{idHidden}
					maxBuggies={10}
					{startTime}
					bind:followRecorded={startFollowRecorded}
					prevFollowRecorded={true}
					bind:didID={startID}
				/>
				<Stop
					name={'Panther'}
					bind:buggies={pantherBuggies}
					{idHidden}
					maxBuggies={startedBuggies}
					{startTime}
					bind:followRecorded={pantherFollowRecorded}
					prevFollowRecorded={startFollowRecorded}
					bind:didID={pantherID}
				/>
				<Stop
					name={'Chute'}
					bind:buggies={chuteBuggies}
					{idHidden}
					maxBuggies={pantheredBuggies}
					{startTime}
					bind:followRecorded={chuteFollowRecorded}
					prevFollowRecorded={pantherFollowRecorded}
					bind:didID={chuteID}
				/>
			{/if}
		</div>
		<div id="settings-row" class="row-span-2 grid grid-flow-col grid-cols-3 gap-x-3">
			{#if showData}
				<!-- content here -->
				<button
					onclick={writeClipboard}
					class="btn {clipboardSubmitted
						? clipboardError
							? 'btn-error'
							: 'btn-success'
						: 'btn-primary'} h-full text-xl">Copy Data To Clipboard</button
				>
			{:else}
				<!-- else content here -->
				<button
					use:press={{ timeframe: 300 }}
					onpress={() => saveDateAndReset(false)}
					use:tap={{ timeframe: 300 }}
					ontap={() => saveDateAndReset(true)}
					disabled={showData}
					class="btn btn-primary h-full text-xl">Save & Reset Round</button
				>
			{/if}
			{#if showData}
				<!-- content here -->
				{#if confirmClear}
					<!-- content here -->
					<button
						onclick={() => {
							confirmClear = false;
							store.value = null;
							info.value = null;
						}}
						class="btn btn-error h-full text-xl">Are you sure?</button
					>
				{:else}
					<button onclick={() => (confirmClear = true)} class="btn btn-secondary h-full text-xl"
						>Clear Data</button
					>
				{/if}
			{:else}
				<!-- else content here -->
				<button onclick={startIDRound} disabled={showData} class="btn btn-secondary h-full text-xl"
					>{idHidden ? 'Start' : 'Cancel'} ID Round</button
				>
			{/if}
			<button
				onclick={() => {
					showData = !showData;
				}}
				class="btn btn-neutral h-full text-xl">See {showData ? 'Controls' : 'Data'}</button
			>
		</div>
	</div>
</div>

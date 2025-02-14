<script>
	import { localStore } from './useLocalStorage.svelte';
	let { config, selectedTheme = $bindable() } = $props();
	import Fa from 'svelte-fa';
	import {
		faArrowUp,
		faArrowDown,
		faUser,
		faPoundSign,
		faSign,
		faIdCard,
		faCross,
		faXmark,
		faPencil,
		faCircleXmark
	} from '@fortawesome/free-solid-svg-icons';
	let selectedTeams = $state(config.value.teams);
	let teamOrder = $state(config.value.teams);
	let selectedStations = $state(config.value.stations);
	let stationOrder = $state(config.value.stations);
	let flipHandedness = $state(false);
	let operators = $state(config.value.operators);
	let currentOperatorName = $state('');
	let currentOperatorCallsign = $state('');
	let currentOperatorStation = $state('');
	let currentOperatorIsPrimary = $state(false);
	let editModal = $state();
	let operatorForModal = $state();
	let operatorIdxForModal = $state();
	let errorMsg = $state('');

	let allTeams = [
		'AEPi',
		'Apex',
		'Atlas',
		'CIA',
		'DG',
		'Fringe',
		'PiKA',
		'Robobuggy',
		'SAE',
		'SDC',
		'SigEp',
		'SigNu',
		'Spirit'
	];

	let allStations = [
		'Net',
		'Panther',
		'Chute',
		'Start',
		'Finish',
		'Broadcast',
		'TV',
		'Westinghouse',
		'Monument',
		'Scaife',
		'Chair Shadow',
		'Safety Shadow'
	];

	let allThemes = [
		'light',
		'dark',
		'cupcake',
		'bumblebee',
		'emerald',
		'corporate',
		'synthwave',
		'retro',
		'cyberpunk',
		'valentine',
		'halloween',
		'garden',
		'forest',
		'aqua',
		'lofi',
		'pastel',
		'fantasy',
		'wireframe',
		'black',
		'luxury',
		'dracula',
		'cmyk',
		'autum',
		'business',
		'acid',
		'lemonade',
		'night',
		'coffee',
		'winter',
		'dim',
		'nord',
		'sunset',
		'caramellatte',
		'abyss',
		'silk'
	];
	function array_move(arr, old_index, new_index) {
		while (old_index < 0) {
			old_index += arr.length;
		}
		while (new_index < 0) {
			new_index += arr.length;
		}
		if (new_index >= arr.length) {
			var k = new_index - arr.length + 1;
			while (k--) {
				arr.push(undefined);
			}
		}
		arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
		return arr;
	}
	function moveUp(list, i) {
		array_move(list, i, Math.max(i - 1, 0));
	}
	function moveDown(list, i) {
		array_move(list, i, Math.min(i + 1, list.length - 1));
	}

	function updateElementOrderInv(elemList, orderList) {
		orderList.forEach((e) => {
			if (!elemList.includes(e)) {
				orderList.splice(orderList.indexOf(e), 1);
			}
		});
		elemList.forEach((e) => {
			if (!orderList.includes(e)) {
				orderList.push(e);
			}
		});
	}

	function saveData() {
		let allStationsHavePrimaryOperator = true;
		stationOrder.forEach((s) => {
			let stationHasPrimaryOperator = false;
			operators.forEach((o) => {
				if (o.station == s && o.isPrimary) {
					stationHasPrimaryOperator = true;
				}
			});
			allStationsHavePrimaryOperator = allStationsHavePrimaryOperator && stationHasPrimaryOperator;
		});
		if (allStationsHavePrimaryOperator) {
			config.value.teams = teamOrder;
			config.value.stations = stationOrder;
			config.value.operators = operators;
			config.value.theme = selectedTheme;
			config.value.handedness = flipHandedness;
			errorMsg = '';
		} else {
			errorMsg = 'All stations need primary operator';
		}
	}
</script>

<div class="row-span-3 flex flex-col overflow-scroll">
	<div class="mx-auto w-7/8">
		<button onclick={() => saveData()} class="btn btn-primary btn-block mt-4 w-full text-xl"
			>Save</button
		>
		<div class:hidden={errorMsg.length == 0} role="alert" class="alert alert-error mt-2 mb-1 py-1">
			<Fa icon={faCircleXmark} />
			<span class="text-lg">{errorMsg}</span>
		</div>
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
			<legend class="fieldset-legend text-lg">Teams</legend>

			<label id="org-select" class="fieldset-label text-base">Select Orgs</label>
			<select
				bind:value={selectedTeams}
				onchange={() => updateElementOrderInv(selectedTeams, teamOrder)}
				id="org-select"
				class="select select-lg"
				multiple
			>
				{#each allTeams as station}
					<option id={station}>{station}</option>
				{/each}
			</select>
			<label id="org-select" class="fieldset-label text-base">Set Roll Order</label>
			<div class="flex flex-col gap-2">
				{#each teamOrder as team, i}
					<div class="card bg-neutral card-md w-full">
						<div class="card-body flex w-full flex-row items-baseline justify-between py-2">
							<span class="text-xl">{team} </span>
							<div class="flex w-1/3 flex-row justify-between">
								<button
									class="btn btn-sm btn-info min-w-[1rem]"
									onclick={() => moveUp(teamOrder, i)}
								>
									<Fa icon={faArrowUp} scale={1.2} class="bg-light" />
								</button>
								<button
									class="btn btn-sm btn-info color-white"
									onclick={() => moveDown(teamOrder, i)}
								>
									<Fa icon={faArrowDown} scale={1.2} class="bg-light" />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</fieldset>
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
			<legend class="fieldset-legend text-lg">Stations</legend>
			<label id="org-select" class="fieldset-label text-base">Select Stations</label>
			<select
				bind:value={selectedStations}
				onchange={() => updateElementOrderInv(selectedStations, stationOrder)}
				id="org-select"
				class="select select-lg"
				multiple
			>
				{#each allStations as station}
					<option id={station}>{station}</option>
				{/each}
			</select>
			<label id="org-select" class="fieldset-label text-base">Set Station Order</label>
			<div class="flex flex-col gap-2">
				{#each stationOrder as team, i}
					<div class="card bg-neutral card-md w-full">
						<div class="card-body flex w-full flex-row items-baseline justify-between py-2">
							<span class="text-xl">{team} </span>
							<div class="flex w-1/3 flex-row justify-between">
								<button
									class="btn btn-sm btn-info min-w-[1rem]"
									onclick={() => moveUp(stationOrder, i)}
								>
									<Fa icon={faArrowUp} scale={1.2} class="bg-light" />
								</button>
								<button
									class="btn btn-sm btn-info color-white"
									onclick={() => moveDown(stationOrder, i)}
								>
									<Fa icon={faArrowDown} scale={1.2} class="bg-light" />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</fieldset>
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
			<legend class="fieldset-legend text-lg">Operators</legend>
			<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
				<legend class="fieldset-legend text-lg">Add Operator</legend>
				<label id="org-select" class="fieldset-label text-base">Operator Name</label>
				<input type="text" class="input" bind:value={currentOperatorName} />
				<label id="org-select" class="fieldset-label text-base">Operator Callsign</label>
				<input type="text" class="input" bind:value={currentOperatorCallsign} />
				<label id="org-select" class="fieldset-label text-base">Select Station</label>
				<select bind:value={currentOperatorStation} class="select">
					{#each stationOrder as station}
						<option id={station}>{station}</option>
					{/each}
					<option>Rover</option>
				</select>
				<label class="fieldset-label text-base">
					Should be primary?
					<input
						type="checkbox"
						bind:checked={currentOperatorIsPrimary}
						class="toggle toggle-xl bg-transparent! bg-none"
						disabled={currentOperatorStation == 'Rover'}
					/>
				</label>

				<button
					onclick={() => {
						if (
							currentOperatorName.length > 0 &&
							currentOperatorCallsign.length > 0 &&
							currentOperatorStation.length > 0
						) {
							operators.push({
								name: currentOperatorName,
								callsign: currentOperatorCallsign,
								lastId: new Date().toUTCString(),
								station: currentOperatorStation,
								isPrimary: currentOperatorIsPrimary
							});
							currentOperatorName = '';
							currentOperatorCallsign = '';
							currentOperatorStation = '';
							currentOperatorIsPrimary = false;
						}
					}}
					class="btn btn-secondary btn-block">Save Operator</button
				>
			</fieldset>

			<label id="org-select" class="fieldset-label text-base">Assign Operators</label>
			<div class="flex flex-col gap-2">
				{#each operators as operator, i}
					<div class="card bg-neutral card-md w-full">
						<div class="card-body flex w-full flex-row items-baseline justify-between py-2">
							<div class="flex h-full w-2/3 flex-col">
								<div class="flex flex-row items-center justify-start gap-2">
									<Fa icon={faUser} class="w-1/8  {operator.isPrimary ? 'text-info' : ''}" />
									<span class="overflow-x-scroll text-lg">{operator.name}</span>
								</div>
								<div class="flex flex-row items-center justify-start gap-2">
									<Fa icon={faIdCard} class="w-1/8" />
									<span class="overflow-x-scroll text-lg">{operator.callsign}</span>
								</div>
								<div class="flex flex-row items-center justify-start gap-2">
									<Fa icon={faSign} class="w-1/8" />
									<span class="overflow-x-scroll text-lg">{operator.station}</span>
								</div>
							</div>
							<div class="flex h-full w-1/3 flex-col justify-between gap-1">
								<button
									class="btn btn-xs btn-error min-w-[1rem] grow-1"
									onclick={() => operators.splice(i, 1)}
								>
									<Fa icon={faXmark} scale={1.2} />
								</button>
								<button
									class="btn btn-sm btn-info grow-2"
									onclick={() => {
										operatorForModal = operator;
										currentOperatorName = operatorForModal.name;
										currentOperatorCallsign = operatorForModal.callsign;
										currentOperatorStation = operatorForModal.station;
										currentOperatorIsPrimary = operatorForModal.isPrimary;
										operatorIdxForModal = i;
										editModal.showModal();
									}}
								>
									<Fa icon={faPencil} scale={1.2} />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
			<dialog class="modal" bind:this={editModal}>
				<div class="modal-box">
					<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
						<legend class="fieldset-legend text-lg">Edit Operator</legend>
						<label id="org-select" class="fieldset-label text-base">Operator Name</label>
						<input type="text" class="input" bind:value={currentOperatorName} />
						<label id="org-select" class="fieldset-label text-base">Operator Callsign</label>
						<input type="text" class="input" bind:value={currentOperatorCallsign} />
						<label id="org-select" class="fieldset-label text-base">Select Station</label>
						<select bind:value={currentOperatorStation} class="select">
							{#each stationOrder as station}
								<option id={station}>{station}</option>
							{/each}
						</select>
						<label class="fieldset-label text-base">
							Should be primary?
							<input
								type="checkbox"
								bind:checked={currentOperatorIsPrimary}
								class="toggle toggle-xl bg-transparent! bg-none"
							/>
						</label>

						<form method="dialog">
							<button
								onclick={() => {
									operators[operatorIdxForModal] = {
										name: currentOperatorName,
										callsign: currentOperatorCallsign,
										station: currentOperatorStation,
										lastId: operatorForModal.lastId,
										isPrimary: currentOperatorIsPrimary
									};
									currentOperatorName = '';
									currentOperatorCallsign = '';
									currentOperatorStation = '';
									currentOperatorIsPrimary = false;
								}}
								class="btn btn-secondary btn-block">Save Operator</button
							>
						</form>
					</fieldset>
				</div>
			</dialog>
		</fieldset>

		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
			<legend class="fieldset-legend text-lg">Misc</legend>
			<label class="fieldset-label text-lg">
				Flip Handedness
				<input
					type="checkbox"
					bind:checked={flipHandedness}
					class="toggle toggle-xl bg-transparent! bg-none"
				/>
			</label>
			<label class="fieldset-label text-base">Select Theme</label>
			<select bind:value={selectedTheme} class="select select-lg">
				<option selected>default</option>
				{#each allThemes as theme}
					<option id={theme}>{theme}</option>
				{/each}
			</select>
		</fieldset>
	</div>
</div>

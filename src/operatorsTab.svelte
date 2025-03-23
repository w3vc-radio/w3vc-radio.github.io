<script>
	import { localStore } from './useLocalStorage.svelte';
	let { config, buggy } = $props();
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
		faCircleXmark,
		faClock
	} from '@fortawesome/free-solid-svg-icons';
	import IdTag from './IdTag.svelte';

	let firstSwapOperator = $state('');
	let secondSwapOperator = $state('');

	let idFunc = (i) => {
		config.value.operators[i].lastId = new Date().toUTCString();
	};

	let stationStatus = (station) => {
		let primaryIdError = false;
		let otherIdError = false;
		let currTime = new Date();
		config.value.operators.forEach((o) => {
			if (o.station == station) {
				let minsAgo = Math.max(Math.floor((currTime - new Date(o.lastId)) / 60000), 0);
				if (o.isPrimary && minsAgo >= 12) {
					primaryIdError = true;
				} else if (minsAgo >= 12) {
					otherIdError = true;
				}
			}
		});
		if (primaryIdError) {
			return 'status-error';
		}
		if (otherIdError) {
			return 'status-warning';
		}
		return 'status-success';
	};
	let stationStatuses = $derived(config.value.stations.map(stationStatus));
	let roverStatus = $derived(stationStatus('Rover'));
	let swapModal = $state();

	let swapOperators = () => {
		if (firstSwapOperator == secondSwapOperator) {
			return;
		}
		let firstOp = config.value.operators.find((op) => op.callsign == firstSwapOperator);
		let secondOp = config.value.operators.find((op) => op.callsign == secondSwapOperator);

		let firstStation = firstOp.station;
		let firstPrimary = firstOp.isPrimary;
		firstOp.station = secondOp.station;
		firstOp.isPrimary = secondOp.isPrimary;
		secondOp.station = firstStation;
		secondOp.isPrimary = firstPrimary;

		config.value.operators = config.value.operators.map((op) => {
			if (op.callsign == firstOp.callsign) {
				return firstOp;
			} else if (op.callsign == secondOp.callsign) {
				return secondOp;
			}
			return op;
		});
	};
</script>

<div class="row-span-3 flex flex-col overflow-scroll">
	<dialog class="modal" bind:this={swapModal}>
		<div class="modal-box">
			<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
				<legend class="fieldset-legend text-lg">Quick Swap</legend>

				<label class="fieldset-label text-base">First Operator</label>
				<select bind:value={firstSwapOperator} class="select select-lg">
					{#each config.value.operators as op}
						<option value={op.callsign}
							>{op.name} ({op.isPrimary ? 'Primary at ' : ''}{op.station})</option
						>
					{/each}
				</select>
				<label class="fieldset-label text-base">Second Operator</label>
				<select bind:value={secondSwapOperator} class="select select-lg">
					{#each config.value.operators as op}
						<option value={op.callsign}
							>{op.name} ({op.isPrimary ? 'Primary at' : ''} {op.station})</option
						>
					{/each}
				</select>

				<form method="dialog">
					<button class="btn btn-primary btn-block my-2" onclick={swapOperators}>Swap</button>
					<button class="btn btn-error btn-block">Cancel</button>
				</form>
			</fieldset>
		</div>
	</dialog>

	<div class="mx-auto w-7/8">
		<button class="btn btn-block btn-secondary" onclick={() => swapModal.showModal()}
			>Quick Swap</button
		>
		{#each config.value.stations as station, stationIdx}
			<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
				<legend class="fieldset-legend text-lg">
					<div class="flex min-w-[1rem] grow-1 flex-row items-center gap-2">
						<div class="inline-grid *:[grid-area:1/1]">
							{#if stationStatuses[stationIdx] == 'status-error'}
								<div class="status {stationStatuses[stationIdx]} animate-ping"></div>
							{/if}
							<div class="status {stationStatuses[stationIdx]}"></div>
						</div>
						<span class=" text-base">{station} Operators</span>
					</div>
				</legend>
				<label class="fieldset-label text-base">Individual Statuses</label>
				<div class="flex flex-col gap-2">
					{#each config.value.operators as operator, i}
						{#if operator.station == station}
							<div class="card bg-neutral card-md w-full">
								<div class="card-body flex w-full flex-row items-baseline justify-between py-2">
									<div class="flex h-full w-1/2 flex-col">
										<div class="flex flex-row items-center justify-start gap-2">
											<Fa icon={faUser} class="w-1/8 {operator.isPrimary ? 'text-info' : ''}" />
											<span class="overflow-x-scroll text-lg">{operator.name}</span>
										</div>
										<div class="flex flex-row items-center justify-start gap-2">
											<Fa icon={faIdCard} class="w-1/8" />
											<span class="overflow-x-scroll text-lg">{operator.callsign}</span>
										</div>
										<div class="flex flex-row items-center justify-start gap-2">
											<Fa icon={faClock} class="w-1/8" />
											<span class="overflow-x-scroll text-lg"
												>{new Date(operator.lastId).toLocaleTimeString()}</span
											>
										</div>
									</div>
									<IdTag lastId={operator.lastId} idx={i} {idFunc} />
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</fieldset>
		{/each}
		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
			<legend class="fieldset-legend text-lg">
				<div class="flex min-w-[1rem] grow-1 flex-row items-center gap-2">
					<div class="inline-grid *:[grid-area:1/1]">
						<div class="status {roverStatus} animate-ping"></div>
						<div class="status {roverStatus}"></div>
					</div>
					<span class=" text-base">Rover Operators</span>
				</div>
			</legend>
			<label class="fieldset-label text-base">Individual Statuses</label>
			<div class="flex flex-col gap-2">
				{#each config.value.operators as operator, i}
					{#if operator.station == 'Rover'}
						<div class="card bg-neutral card-md w-full">
							<div class="card-body flex w-full flex-row items-baseline justify-between py-2">
								<div class="flex h-full w-1/2 flex-col">
									<div class="flex flex-row items-center justify-start gap-2">
										<Fa icon={faUser} class="w-1/8 {operator.isPrimary ? 'text-info' : ''}" />
										<span class="overflow-x-scroll text-lg">{operator.name}</span>
									</div>
									<div class="flex flex-row items-center justify-start gap-2">
										<Fa icon={faIdCard} class="w-1/8" />
										<span class="overflow-x-scroll text-lg">{operator.callsign}</span>
									</div>
									<div class="flex flex-row items-center justify-start gap-2">
										<Fa icon={faClock} class="w-1/8" />
										<span class="overflow-x-scroll text-lg"
											>{new Date(operator.lastId).toLocaleTimeString()}</span
										>
									</div>
								</div>
								<IdTag lastId={operator.lastId} idx={i} {idFunc} />
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</fieldset>
	</div>
</div>

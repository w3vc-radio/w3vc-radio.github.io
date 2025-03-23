<script>
	import { press, tap } from 'svelte-gestures';
	import BuggyCard from './buggyCard.svelte';
	let {
		buggies = $bindable(),
		idHidden,
		maxBuggies,
		startTime,
		followRecorded = $bindable(),
		prevFollowRecorded,
		name,
		undoList = $bindable(),
		didID = $bindable(),
		operatorLastIdUpdateFunc,
		idx,
		config = $bindable()
	} = $props();
	let orgMap = {
		AEPi: 'AEP',
		Apex: 'APX',
		Atlas: 'ATL',
		CIA: 'CIA',
		DG: 'DG',
		Fringe: 'FRI',
		PiKA: 'PKA',
		Robobuggy: 'RBO',
		SAE: 'SAE',
		SDC: 'SDC',
		SigEp: 'SEP',
		SigNu: 'SN',
		Spirit: 'SPI'
	};
	let buggyLength = $derived(buggies.length.valueOf());
	let buggyModal = $state();
	let buggyOrg = $state('');
	let buggyUrls = $state();
	let updateBuggyUrls = async (buggyOrg) => {
		const response = await fetch('https://cmubuggy.org/api/orgbuggylist/' + buggyOrg);
		if (response.ok) {
			response.json().then((res) => {
				buggyUrls = res;
			});
		}
	};
	let timeFormat = { hour: '2-digit' };
	let canRecordBuggy = $derived(
		!followRecorded && buggyLength < Math.min(6, maxBuggies - prevFollowRecorded)
	);
	let canRecordFollow = $derived(!followRecorded && prevFollowRecorded);
	let shouldRecordFollow = $state(false);
	let saveBuggy = (buggyId, buggyTitle) => {
		if (canRecordBuggy) {
			buggies.push({
				time: new Date(),
				number: buggies.length + 1,
				buggyId: buggyId,
				buggyTitle: buggyTitle
			});
			undoList.push(idx);
		}
	};

	let saveFollow = (event) => {
		if (canRecordFollow) {
			buggies.push({
				time: new Date(),
				number: 'F'
			});
			followRecorded = true;
			undoList.push(idx);
		}
	};

	export const removeLastBuggy = () => {
		if (followRecorded) {
			followRecorded = false;
		}
		buggies.pop();
	};

	let formatTime = (buggy) => {
		if (buggy.number == '1' || buggy.number == 'F') {
			let diff = buggy.time - startTime;
			let seconds = Math.ceil(diff / 1000) % 60;
			let minutes = Math.floor(Math.max(diff / 1000 - seconds, 0) / 60);
			return `@${minutes}:${String(seconds).padStart(2, '0')}`;
		} else {
			let prevBuggy = buggies[buggies.indexOf(buggy) - 1];
			let diff = buggy.time - prevBuggy.time;
			let seconds = Math.floor(diff / 1000) % 60;
			let minutes = Math.floor(Math.max(diff / 1000 - seconds, 0) / 60);
			return `+${minutes}:${String(Math.floor(seconds)).padStart(2, '0')}`;
		}
	};

	let captureIDed = () => {
		didID = !didID;
		operatorLastIdUpdateFunc(new Date().toUTCString());
	};
	let stationStatusFunc = (station) => {
		let primaryIdError = false;
		let otherIdError = false;
		let currTime = new Date();
		config.value.operators.forEach((o) => {
			if (o.station == station) {
				let minsAgo = Math.max(Math.floor(currTime - new Date(o.lastId) / 60000), 0);
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
	let stationStatus = $state(stationStatusFunc(name));
	setTimeout(() => (stationStatus = stationStatusFunc(name)), 60000);
</script>

<div class="grid shrink-0 basis-1/3 grid-flow-row grid-cols-12 py-3">
	{#if idx == 0 && config.value.showImages}
		<dialog class="modal" bind:this={buggyModal}>
			<div class="modal-box">
				<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
					<legend class="fieldset-legend text-lg">Buggy Selection</legend>

					<label class="fieldset-label text-base">Organization</label>
					<select
						bind:value={buggyOrg}
						onchange={(selected) => updateBuggyUrls(selected.target.value)}
						class="select select-lg"
					>
						{#each config.value.teams as org}
							<option value={orgMap[org]}>{org}</option>
						{/each}
					</select>
					<label class="fieldset-label text-base">Buggy</label>
					<div
						class="mx-auto flex max-h-[50svh] w-fit flex-row flex-wrap gap-x-3 gap-y-4 overflow-scroll"
					>
						{#each buggyUrls as buggy}
							<div class="card bg-base-300 card-sm shadow-sm">
								<figure>
									<img
										alt=""
										src={'https://cmubuggy.org/api/buggyimg/' + buggy.buggyid + '?size=Th'}
									/>
								</figure>
								<div class="card-body">
									<h2 class="card-title">{buggy.name} ({buggy.birthyear})</h2>
									<div class="card-actions justify-center">
										<button
											class="btn btn-primary"
											onclick={() => {
												buggyModal.close();

												saveBuggy(buggy.buggyid, buggy.name + ' (' + buggyOrg + ')');
											}}>Select</button
										>
									</div>
								</div>
							</div>
						{/each}
					</div>
					<form method="dialog">
						<button class="btn btn-error btn-block" onclick={() => saveBuggy(undefined, undefined)}
							>Cancel</button
						>
					</form>
				</fieldset>
			</div>
		</dialog>
	{/if}
	<div class="col-span-1 [text-orientation:sideways] [writing-mode:vertical-lr]">
		<div class="rotate-180 touch-manipulation text-center">
			<div class="flex flex-row items-center justify-center gap-3">
				<div class="inline-grid *:[grid-area:1/1]">
					<div class="status {stationStatus}"></div>
				</div>
				<p>{name}</p>
			</div>
		</div>
	</div>
	<div class="col-span-7 grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-1 gap-y-1.5 p-1">
		{#each buggies as buggy (buggy.number)}
			<div
				class="text-light bg-base-300 flex flex-initial flex-col justify-around space-x-1 rounded-sm p-2 shadow-xl"
			>
				{#if buggy.buggyId && config.value.showImages}
					<BuggyCard {buggy} />
				{/if}
				<div class="flex flex-row justify-around">
					<div class="my-auto font-mono text-xl italic">{buggy.number}</div>
					<div class="my-auto font-mono text-xl">{formatTime(buggy)}</div>
				</div>
			</div>
		{/each}
	</div>
	<div class="col-span-4 mx-2 flex flex-col space-y-1">
		<div class="flex grow-10 flex-row gap-2">
			<button
				use:press={{ timeframe: 300, triggerBeforeFinished: true }}
				onpress={() => {
					shouldRecordFollow = true;
				}}
				onclick={() => {
					if (shouldRecordFollow) {
						saveFollow();
						shouldRecordFollow = false;
					} else {
						if (idx == 0 && config.value.showImages) {
							buggyModal.showModal();
						} else {
							saveBuggy(undefined, undefined);
						}
					}
				}}
				disabled={!canRecordBuggy && !canRecordFollow}
				class:btn-primary={canRecordBuggy || canRecordFollow}
				class="btn h-full grow text-lg"
				>Record {canRecordBuggy && !shouldRecordFollow ? buggies.length + 1 : 'F'}</button
			>

			<!-- <button -->
			<!-- 	onclick={saveFollow} -->
			<!-- 	disabled={!canRecordFollow} -->
			<!-- 	class:btn-primary={canRecordFollow} -->
			<!-- 	class="btn h-full grow text-lg">F</button -->
			<!-- > -->
		</div>
		<button
			class:hidden={idHidden}
			onclick={captureIDed}
			class="btn {didID ? 'btn-success' : 'btn-secondary'} grow-1 text-xl"
			>{didID ? "ID'd" : 'ID?'}</button
		>
	</div>
</div>

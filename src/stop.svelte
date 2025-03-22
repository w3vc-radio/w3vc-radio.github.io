<script>
	import { press, tap } from 'svelte-gestures';
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
	let buggyLength = $derived(buggies.length.valueOf());
	let timeFormat = { hour: '2-digit' };
	let canRecordBuggy = $derived(
		!followRecorded && buggyLength < Math.min(6, maxBuggies - prevFollowRecorded)
	);
	let canRecordFollow = $derived(!followRecorded && prevFollowRecorded);
	let shouldRecordFollow = $state(false);
	let saveBuggy = (event) => {
		if (canRecordBuggy) {
			buggies.push({
				time: new Date(),
				number: buggies.length + 1
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
			let minutes = Math.max(Math.floor(diff / 1000 - seconds), 0) / 60;
			return `@${minutes}:${String(seconds).padStart(2, '0')}`;
		} else {
			let prevBuggy = buggies[buggies.indexOf(buggy) - 1];
			let diff = buggy.time - prevBuggy.time;
			let seconds = Math.floor(diff / 1000) % 60;
			let minutes = Math.max(Math.floor(diff / 1000 - seconds), 0) / 60;
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
	let stationStatus = $state(stationStatusFunc(name));
	setTimeout(() => (stationStatus = stationStatusFunc(name)), 60000);
</script>

<div class="grid shrink-0 basis-1/3 grid-flow-row grid-cols-12 py-3">
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
	<div
		class="col-span-7 grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-1 gap-y-1.5 overflow-hidden p-1"
	>
		{#each buggies as buggy (buggy.number)}
			<div
				class="text-light bg-base-300 flex flex-initial flex-row justify-around space-x-1 rounded-sm px-1 shadow-xl"
			>
				<div class="my-auto font-mono text-xl italic">{buggy.number}</div>
				<div class="my-auto font-mono text-xl">{formatTime(buggy)}</div>
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
						saveBuggy();
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

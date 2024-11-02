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
		didID
	} = $props();
	let buggyLength = $derived(buggies.length.valueOf());
	let timeFormat = { hour: '2-digit' };
	let canRecordBuggy = $derived(
		!followRecorded && buggyLength < Math.min(5, maxBuggies - prevFollowRecorded)
	);
	let canRecordFollow = $derived(!followRecorded && prevFollowRecorded);
	let saveBuggy = (event) => {
		if (canRecordBuggy) {
			buggies.push({
				time: new Date(),
				number: buggies.length + 1
			});
		}
	};

	let saveFollow = (event) => {
		if (canRecordFollow) {
			buggies.push({
				time: new Date(),
				number: 'F'
			});
			followRecorded = true;
		}
	};

	let removeLastBuggy = () => {
		if (followRecorded) {
			followRecorded = false;
		}
		buggies.pop();
	};

	let formatTime = (buggy) => {
		if (buggy.number == '1' || buggy.number == 'F') {
			let diff = buggy.time - startTime;
			let seconds = (diff / 1000) % 60;
			let minutes = (diff / 1000 - seconds) / 60;
			return `@${minutes}:${String(Math.ceil(seconds)).padStart(2, '0')}`;
		} else {
			let prevBuggy = buggies[buggies.indexOf(buggy) - 1];
			let diff = buggy.time - prevBuggy.time;
			let seconds = (diff / 1000) % 60;
			let minutes = (diff / 1000 - seconds) / 60;
			return `+${minutes}:${String(Math.ceil(seconds)).padStart(2, '0')}`;
		}
	};

	let captureIDed = () => {
		didID = !didID;
	};

</script>

<div class="row-span-1 grid grid-flow-row grid-cols-12">
	<div class="col-span-1 [writing-mode:vertical-lr]">
		<p class="rotate-180 text-center">{name}</p>
	</div>
	<div class="col-span-7 grid grid-flow-col grid-cols-2 grid-rows-3 gap-1 p-1">
		{#each buggies as buggy (buggy.number)}
			<div class="text-light flex flex-row justify-around space-x-1 rounded bg-base-300 shadow-xl px-1">
				<div class="text-md font-mono italic my-auto">{buggy.number}</div>
				<div class="text-md my-auto font-mono">{formatTime(buggy)}</div>
			</div>
		{/each}
		<div class="col-span-1 col-start-2 row-span-1 row-start-3">
			<button
				onclick={removeLastBuggy}
				class="h-full max-h-full w-full max-w-full rounded-btn bg-neutral text-center text-accent transition ease-in-out active:scale-[0.9]"
				>Undo</button
			>
		</div>
	</div>
	<div class="col-span-4 mx-2 flex flex-col space-y-1">
		<div class="flex flex-grow flex-row gap-2">
			<button
				use:press={{ timeframe: 300 }}
				onpress={saveFollow}
				use:tap={{ timeframe: 300 }}
				ontap={saveBuggy}
				disabled={!canRecordBuggy && !canRecordFollow}
				class:btn-primary={canRecordBuggy || canRecordFollow}
				class="btn h-full flex-grow text-lg"
				>Record {canRecordBuggy ? buggies.length + 1 : 'F'}</button
			>

			<!-- <button -->
			<!-- 	onclick={saveFollow} -->
			<!-- 	disabled={!canRecordFollow} -->
			<!-- 	class:btn-primary={canRecordFollow} -->
			<!-- 	class="btn h-full flex-grow text-lg">F</button -->
			<!-- > -->
		</div>
		<button
			class:hidden={idHidden}
			onclick={captureIDed}
			class="btn {didID ? 'btn-success' : 'btn-secondary'} max-h-3 flex-grow text-xl"
			>{didID ? "ID'd" : 'ID?'}</button
		>
	</div>
</div>

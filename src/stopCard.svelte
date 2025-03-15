<script>
	let { name, buggies, startTime } = $props();

	let formatTime = (buggy, idx, buggies) => {
		if (buggy.number == '1' || buggy.number == 'F') {
			let diff = new Date(buggy.time) - startTime;
			let seconds = (diff / 1000) % 60;
			let minutes = (diff / 1000 - seconds) / 60;
			return `@${minutes}:${String(Math.ceil(seconds)).padStart(2, '0')}`;
		} else {
			let prevBuggy = buggies[buggies.indexOf(buggy) - 1];
			let diff = new Date(buggy.time) - new Date(prevBuggy.time);
			let seconds = (diff / 1000) % 60;
			let minutes = (diff / 1000 - seconds) / 60;
			return `+${minutes}:${String(Math.floor(seconds)).padStart(2, '0')}`;
		}
	};
</script>

<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
	<legend class="fieldset-legend text-lg">{name}</legend>
	<div class="flex flex-row gap-2">
		{#each buggies as buggy, idx}
			<div
				class="text-light bg-base-300 flex flex-initial flex-row justify-around space-x-1 rounded-sm px-1 shadow-xl"
			>
				<div class="my-auto text-xl">{buggy.number}</div>
				<div class="my-auto font-mono text-xl">{formatTime(buggy, idx, buggies)}</div>
			</div>
		{/each}
	</div>
</fieldset>

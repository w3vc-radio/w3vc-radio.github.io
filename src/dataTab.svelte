<script>
	import { localStore } from './useLocalStorage.svelte';
	import StopCard from './stopCard.svelte';
	import DataCard from './dataCard.svelte';
	let buggyData = localStore('buggy', []);
	let configData = localStore('config', []);

	let { exportSubmitted = $bindable(), exportError = $bindable() } = $props();

	let removeEntry = (i) => {
		let prevData = $state.snapshot(buggyData.value);
		prevData.splice(prevData.length - 1 - i, 1);
		buggyData.value = prevData;
	};

	let updateEntry = (i, e) => {
		buggyData.value[i] = e;
	};
</script>

<div class="row-span-3 flex flex-col overflow-scroll">
	{#each buggyData.value.toReversed() as round, i}
		<DataCard
			round={buggyData.value[i]}
			idx={buggyData.value.length - i}
			{removeEntry}
			{updateEntry}
		/>
	{/each}
</div>

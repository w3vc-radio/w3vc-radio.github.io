<script>
	import { localStore } from './useLocalStorage.svelte';
	import StopCard from './stopCard.svelte';
	let buggyData = localStore('buggy', []);

	let loadData = () => {
		let data = $state.snapshot(buggyData.value);
		data.forEach((element) => {
			element.startTime = new Date(element.startTime);
			element.buggies.forEach((station) =>
				station.buggies.forEach((buggy) => (buggy.time = new Date(buggy.time)))
			);
		});
		return data;
	};

	let removeEntry = (i) => {
		let prevData = $state.snapshot(buggyData.value);
		prevData.splice(prevData.length - 1 - i, 1);
		value.value = prevData;
	};
</script>

<div class="row-span-3 flex flex-col overflow-scroll">
	{#each loadData().reverse() as round, i}
		<!-- content here -->
		<div class="card bg-base-300 my-2 flex flex-col p-4">
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
					class="active:bg-warning-200 bg-warning rounded-md p-2 text-sm transition active:scale-[0.9]"
				>
					<svg class="h-3 w-3 fill-inherit" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"
						><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
							d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
						/></svg
					>
				</button>
			</div>
			{#each round.buggies as stationInfo}
				<StopCard name={stationInfo.name} buggies={stationInfo.buggies} />
			{/each}
			{#if round.notes.length > 0}
				<fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-full border p-4">
					<legend class="fieldset-legend text-lg">Stop/Pause Notes</legend>
					{#each round.notes as note}
						<label id="org-select" class="fieldset-label text-base"
							>{note.stopOrPause ? 'Stop' : 'Pause'} at {new Date(
								note.time
							).toLocaleTimeString()}</label
						>
						<input type="text" class="input" value={note.info} />
					{/each}
				</fieldset>
			{/if}
		</div>
	{/each}
</div>

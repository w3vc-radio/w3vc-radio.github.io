<script>
	import Fa from 'svelte-fa';
	import StopCard from './stopCard.svelte';
	import { faClock, faIdBadge, faSitemap, faXmark } from '@fortawesome/free-solid-svg-icons';

	let { round, idx, removeEntry, updateEntry } = $props();

	let currInfo = $state(round);

	let saveData = () => {
		updateEntry(idx, $state.snapshot(currInfo));
	};
</script>

<!-- content here -->
<div class="card bg-base-300 my-2 flex flex-col p-4">
	<div class="flex w-full flex-row justify-between">
		<p class="badge badge-primary badge-xl"><Fa icon={faSitemap} />{currInfo.team}</p>
		<p class="badge badge-secondary badge-xl">
			<Fa icon={faClock} />{new Date(currInfo.startTime)
				.getHours()
				.toString()
				.padStart(2, '0')}:{new Date(currInfo.startTime).getMinutes().toString().padStart(2, '0')}
		</p>
		<p class="badge badge-info badge-xl"><Fa icon={faIdBadge} />{currInfo.didID ? 'Y' : 'N'}</p>
		<button onclick={() => removeEntry(idx)} class="btn btn-warning btn-sm">
			<Fa icon={faXmark} scale="1.5x" />
		</button>
	</div>
	{#each currInfo.buggies as stationInfo}
		<StopCard
			name={stationInfo.name}
			buggies={stationInfo.buggies}
			startTime={new Date(currInfo.startTime)}
		/>
	{/each}
	{#if currInfo.notes.length > 0}
		<fieldset class="fieldset bg-base-100 border-base-300 roundoed-box w-full border p-4">
			<legend class="fieldset-legend text-lg">Stop/Pause Notes</legend>
			{#each currInfo.notes as note, i}
				<label id="org-select" class="fieldset-label text-base"
					>{note.stopOrPause ? 'Stop' : 'Pause'} at {new Date(
						note.time
					).toLocaleTimeString()}</label
				>
				<input type="text" class="input" bind:value={note.info} />
			{/each}
		</fieldset>
	{/if}
</div>

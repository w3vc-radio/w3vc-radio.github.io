<script>

 let {
	 lastId,
	 idx,
	 idFunc
 } = $props();

 let currTime = $state(new Date());
 let minsAgo = $derived(Math.max(Math.floor((currTime - new Date(lastId)) / 60000),0));
 let warningThresh = 8;
 let errorThresh = 12;

let timeout = setTimeout(() => currTime = new Date(), 60000);

</script>

<div class="flex h-full w-1/2 flex-col justify-between gap-1">
	<div class="flex min-w-[1rem] grow-1 flex-row items-center gap-2">
		<div class="inline-grid *:[grid-area:1/1]">
			{#if minsAgo >= warningThresh}
			<div
				class="status {minsAgo >= errorThresh
					? 'status-error'
					: minsAgo >= warningThresh
						? 'status-warning'
						: 'status-success'} animate-ping"
			></div>
			{/if}
			<div
				class="status {minsAgo >= errorThresh
					? 'status-error'
					: minsAgo >= warningThresh
						? 'status-warning'
						: 'status-success'}"
			></div>
		</div>
		<span class=" text-base">ID'd {minsAgo}m ago</span>
	</div>

	<button class="btn btn-block btn-lg mb-1 grow-1 {minsAgo >= warningThresh
						? 'btn-primary'
						: 'btn-secondary'}" onclick={() => idFunc(idx)}> ID </button>
</div>

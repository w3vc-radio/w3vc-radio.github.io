<script>
	let { name, buggies } = $props();
</script>

<div class="flex flex-row flex-wrap justify-between gap-2">
	<div class="flex flex-row gap-2">
		<span class="text-primary text-md">{name}:</span>
		<div class="flex flex-row flex-wrap justify-start gap-1">
			{#each buggies as buggy, idx}
				<p class="whitespace-nowrap text-md">
					<span class="mr-0 whitespace-nowrap"
						>{buggy.number}&ndash;{buggy.time.getHours().toString().padStart(2, '0')}:{buggy.time
							.getMinutes()
							.toString()
							.padStart(2, '0')}:{buggy.time.getSeconds().toString().padStart(2, '0')}
					</span>{#if idx < buggies.length - 1}<span>,</span>{/if}
				</p>
				<!-- content here -->
			{/each}
		</div>
	</div>
</div>

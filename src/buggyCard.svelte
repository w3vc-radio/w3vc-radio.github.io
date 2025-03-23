<script>
	let { buggy } = $props();

	let isHovered = $state(false);
</script>

<div
	class="mx-auto flex flex-col"
	onclick={() => {
		isHovered = !isHovered;
	}}
>
	<div class="tooltip" class:tooltip-open={isHovered}>
		<div class="tooltip-content">{buggy.buggyTitle}</div>
		<div class="avatar">
			<div class="w-15 rounded">
				<img alt="" src={'https://cmubuggy.org/api/buggyimg/' + buggy.buggyId + '?size=Th'} />
			</div>
		</div>
	</div>
</div>

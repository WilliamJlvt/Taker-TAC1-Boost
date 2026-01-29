<script lang="ts">
	import { Tooltip } from 'layerchart';

	let {
		labelFormatter = (v: unknown) => String(v),
		indicator = 'dot'
	}: {
		labelFormatter?: (value: unknown) => string;
		indicator?: 'dot' | 'line';
	} = $props();
</script>

<Tooltip.Root let:data>
	<div class="bg-white rounded-lg shadow-lg border border-[#122555]/10 p-3 text-sm">
		{#if data}
			<div class="font-medium text-[#122555] mb-1">
				{labelFormatter(data.date || data.x)}
			</div>
			<div class="text-[#122555]/70">
				Score: <span class="font-bold">{data.y || data.score}%</span>
			</div>
		{/if}
	</div>
</Tooltip.Root>

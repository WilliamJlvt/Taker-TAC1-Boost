<script lang="ts">
	import type { ChartConfig } from './index.js';

	let {
		config,
		class: className = '',
		children
	}: { config: ChartConfig; class?: string; children?: any } = $props();
</script>

<div class="w-full h-full {className}">
	{@render children?.()}
</div>

<script lang="ts">
	import { Tooltip } from 'layerchart';

	let {
		labelFormatter = (v: unknown) => String(v),
		valueFormatter = (key: string, v: unknown) => String(v)
	}: {
		labelFormatter?: (value: unknown) => string;
		valueFormatter?: (key: string, value: unknown) => string;
	} = $props();
</script>

<Tooltip.Root let:data>
	<div class="bg-white rounded-lg shadow-lg border border-[#122555]/10 p-3 text-sm min-w-[120px]">
		{#if data}
			<div class="font-medium text-[#122555] mb-2">
				{labelFormatter(data.date || data.x)}
			</div>
			<div class="space-y-1">
				{#if data.series && Array.isArray(data.series)}
					{#each data.series as s (s.key)}
						<div class="flex items-center gap-2">
							<span class="w-2 h-2 rounded-full" style="background-color: {s.color}"></span>
							<span class="text-[#122555]/70">{s.label}:</span>
							<span class="font-bold text-[#122555]">{valueFormatter(s.key, s.value)}</span>
						</div>
					{/each}
				{:else if data.y !== undefined}
					<div class="text-[#122555]/70">
						<span class="font-bold">{valueFormatter('value', data.y)}</span>
					</div>
				{:else if data.count !== undefined}
					<div class="text-[#122555]/70">
						Participations: <span class="font-bold">{data.count}</span>
					</div>
				{:else if data.Organisationnel !== undefined || data.tresorerie !== undefined}
					{#if data.Organisationnel !== undefined}
						<div class="flex items-center gap-2">
							<span class="w-2 h-2 rounded-full bg-blue-500"></span>
							<span class="text-[#122555]/70">Organisationnel:</span>
							<span class="font-bold text-[#122555]">{data.Organisationnel}%</span>
						</div>
					{/if}
					{#if data.tresorerie !== undefined}
						<div class="flex items-center gap-2">
							<span class="w-2 h-2 rounded-full bg-amber-500"></span>
							<span class="text-[#122555]/70">Trésorerie:</span>
							<span class="font-bold text-[#122555]">{data.tresorerie}%</span>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</Tooltip.Root>

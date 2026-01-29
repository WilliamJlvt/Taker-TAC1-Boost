<script lang="ts">
    import FileQuestionIcon from '@lucide/svelte/icons/file-question';
    import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
    import UsersIcon from '@lucide/svelte/icons/users';

    let { data } = $props();
</script>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-[#122555]">Tableau de bord</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Questions Card -->
        <a href="/admin/questions" class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
            <div class="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                <FileQuestionIcon class="w-8 h-8" />
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Total Questions</p>
                <p class="text-2xl font-bold text-[#122555]">{data.stats.questions}</p>
            </div>
        </a>

        <!-- Categories Card -->
        <a href="/admin/categories" class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
            <div class="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                <FolderOpenIcon class="w-8 h-8" />
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Catégories</p>
                <p class="text-2xl font-bold text-[#122555]">{data.stats.categories}</p>
            </div>
        </a>

        <!-- Users Card -->
        <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div class="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <UsersIcon class="w-8 h-8" />
            </div>
            <div>
                <p class="text-sm text-gray-500 font-medium">Utilisateurs</p>
                <p class="text-2xl font-bold text-[#122555]">{data.stats.users}</p>
            </div>
        </div>
    </div>
</div>

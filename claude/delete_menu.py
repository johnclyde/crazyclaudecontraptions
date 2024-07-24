from menu import Menu, MenuOption
from sync_state import File, SyncManager


class DeleteMenu(Menu):
    def __init__(self, sync_manager: SyncManager) -> None:
        super().__init__("Delete Remote Files")
        self.sync_manager = sync_manager

    def update_options(self) -> None:
        self.options.clear()
        for file in self.sync_manager.state.get_only_remote():
            self.add_option(DeleteFileOption(self.sync_manager, file))


class DeleteFileOption(MenuOption):
    def __init__(self, sync_manager: SyncManager, file: File) -> None:
        super().__init__(f"Delete {file.path}")
        self.sync_manager = sync_manager
        self.file = file

    def run(self) -> None:
        confirm = input(
            f"Are you sure you want to delete {self.file.remote_path}? (y/n): "
        )
        if confirm.lower() == "y":
            self.sync_manager.delete_file(self.file)
        else:
            print("Deletion cancelled.")

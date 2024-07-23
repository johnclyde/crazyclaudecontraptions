from abc import abstractmethod



class MenuOption:
    def __init__(self, label: str) -> None:
        self.label = label

    @abstractmethod
    def run(self):
        pass


class Menu(MenuOption):
    def __init__(self, label: str) -> None:
        self.label = label
        self.options: list[MenuOption] = []

    def add_option(self, option: MenuOption) -> None:
        self.options.append(option)

    def display(self) -> None:
        print(f"\n{self.label}")
        for index, option in enumerate(self.options, 1):
            print(f"{index}. {option.label}")
        print("0. Exit")

    def run(self) -> None:
        while True:
            self.update_options()
            self.display()
            choice = int(input("Enter your choice: ")) - 1
            if choice == -1:
                return
            if 0 <= choice < len(self.options):
                self.options[choice].run()
            else:
                print("Invalid choice. Please try again.")

    @abstractmethod
    def update_options(self) -> None:
        pass

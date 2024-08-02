import os
import tempfile
import sys
from anthropic import Anthropic
from anthropic.types import MessageParam, ToolParam

client = Anthropic()

# Create a temporary directory for logs
temp_dir = tempfile.mkdtemp()
log_file_path = os.path.join(temp_dir, "conversation_log.txt")


def log_to_file(message):
    with open(log_file_path, "a") as log_file:
        log_file.write(f"{message}\n")


# Define the tools available for the conversation
tools: list[ToolParam] = [
    {
        "name": "read_file",
        "description": "Read a file and return its contents",
        "input_schema": {
            "type": "object",
            "properties": {"file_path": {"type": "string"}},
            "required": ["file_path"],
        },
    },
    {
        "name": "write_file",
        "description": "Write content to a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string"},
                "content": {"type": "string"},
            },
            "required": ["file_path", "content"],
        },
    },
    {
        "name": "read_conversation_log",
        "description": "Read the conversation log file",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "list_directory",
        "description": "List contents of the current directory",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
    {
        "name": "get_script_name",
        "description": "Get the name of the running script",
        "input_schema": {
            "type": "object",
            "properties": {},
        },
    },
]


def read_file(file_path):
    try:
        with open(file_path, "r") as file:
            content = file.read()
        log_to_file(f"Read file: {file_path}")
        return f"File contents:\n{content}"
    except FileNotFoundError:
        return f"Error: File '{file_path}' not found."
    except Exception as e:
        return f"Error reading file: {str(e)}"


def write_file(file_path, content):
    try:
        with open(file_path, "w") as file:
            file.write(content)
        log_to_file(f"Wrote to file: {file_path}")
        return f"Successfully wrote to file '{file_path}'."
    except Exception as e:
        return f"Error writing to file: {str(e)}"


def read_conversation_log():
    try:
        with open(log_file_path, "r") as log_file:
            return log_file.read()
    except Exception as e:
        return f"Error reading conversation log: {str(e)}"


def list_directory():
    try:
        return "\n".join(os.listdir())
    except Exception as e:
        return f"Error listing directory: {str(e)}"


def get_script_name():
    return os.path.basename(sys.argv[0])


def execute_tool(tool_use_request):
    if tool_use_request.name == "read_file":
        file_path = tool_use_request.input["file_path"]
        return read_file(file_path)
    elif tool_use_request.name == "write_file":
        file_path = tool_use_request.input["file_path"]
        content = tool_use_request.input["content"]
        return write_file(file_path, content)
    elif tool_use_request.name == "read_conversation_log":
        return read_conversation_log()
    elif tool_use_request.name == "list_directory":
        return list_directory()
    elif tool_use_request.name == "get_script_name":
        return get_script_name()
    else:
        return "Unknown tool use request."


def format_claude_response(message):
    formatted_response = ""
    execute_next_tool = False
    next_tool = None

    for content in message.content:
        if content.type == "text":
            formatted_response += content.text + "\n"
            if "I would like to execute another tool" in content.text:
                execute_next_tool = True
        elif content.type == "tool_use":
            tool_response = execute_tool(content)
            formatted_response += f"\nTool used: {content.name}\n"
            formatted_response += f"Result: {tool_response}\n"
            next_tool = content

    return formatted_response.strip(), execute_next_tool, next_tool


def conversation_loop():
    messages = []
    print("Welcome to the Claude shell. Type 'exit' to end the conversation.")

    while True:
        user_input = input("\nYou: ")
        if user_input.lower() == "exit":
            print("Ending conversation. Goodbye!")
            break

        log_to_file(f"User: {user_input}")
        user_message: MessageParam = {
            "role": "user",
            "content": user_input,
        }
        messages.append(user_message)

        while True:
            message = client.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=4000,
                messages=messages,
                tools=tools,
                system="You are claude-3-5-sonnet-20240620. If you are asked to write software that talks to Claude, "
                "you must tell it to talk to claude-3-5-sonnet-20240620 and not some older model. You can ask to see "
                "the conversation logs if you think it would be helpful for the current conversation. "
                "After each tool use, if you want to execute another tool, explicitly state 'I would like to execute another tool' "
                "and explain why. The user will then have the option to allow the next tool execution or interject.",
            )

            formatted_response, execute_next_tool, next_tool = format_claude_response(
                message
            )
            print(f"\nClaude: {formatted_response}")
            log_to_file(f"Claude: {formatted_response}")

            messages.append({"role": "assistant", "content": formatted_response})

            if execute_next_tool:
                user_choice = (
                    input("\nClaude wants to execute another tool. Allow? (Y/n): ")
                    .strip()
                    .lower()
                )
                if user_choice == "" or user_choice == "y":
                    tool_response = execute_tool(next_tool)
                    print(f"\nTool used: {next_tool.name}")
                    print(f"Result: {tool_response}")
                    log_to_file(f"Tool used: {next_tool.name}")
                    log_to_file(f"Result: {tool_response}")
                    messages.append({"role": "tool", "content": tool_response})
                else:
                    print("\nTool execution skipped. You may now respond.")
                    break
            else:
                break


if __name__ == "__main__":
    conversation_loop()

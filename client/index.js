import TerminalController from "./src/terminalController.js"
import Events from 'events'
import CliConfig from "./src/cliConfig.js"
import SocketClient from "./src/socket.js"

/*
node index.js \
    --username bruno \
    --room sala01 \
    --hostUri localhost
*/

const [nodePath, filePath, ...commands] = process.argv
const config = CliConfig.parseArguments(commands)
console.log(config)

const componentEmitter = new Events()

const sockerClient = new SocketClient(config)
await sockerClient.initialize()

const controller = new TerminalController()
await controller.initializeTable(componentEmitter)
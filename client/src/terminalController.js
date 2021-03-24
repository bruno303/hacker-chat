import { constants } from "./constants.js"
import ComponentsBuilder from "./components.js"

export default class TerminalController {
    #usersColors = new Map()
    constructor() {}

    #pickColor() {
        return '#' + ((1 << 24) * Math.random() | 0).toString(16) + '-fg'
    }

    #getUserColor(userName) {
        if (this.#usersColors.has(userName)) {
            return this.#usersColors.get(userName)
        }

        const color = this.#pickColor()
        this.#usersColors.set(userName, color)

        return color
    }

    #onInputReceived(eventEmitter) {
        return function() {
            const message = this.getValue()
            console.log(message)
            this.clearValue()
        }
    }

    #onMessageReceived({ screen, chat }) {
        return msg => {
            const { userName, message } = msg
            const color = this.#getUserColor(userName)
            chat.addItem(`{${color}}{bold}${userName}{/} : ${message}`)
            screen.render()
        }
    }

    #onLogChanged({ screen, activityLog }) {
        return msg => {
            const [userName] = msg.split(/\s/)
            const color = this.#getUserColor(userName)
            activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`)
            screen.render()
        }
    }

    #onStatusChanged({ screen, status }) {
        return users => {

            const { content } = status.items.shift()
            status.clearItems()
            status.addItem(content)

            users.forEach(userName => {
                const color = this.#getUserColor(userName)
                status.addItem(`{${color}}{bold}${userName}{/}`)
            })

            screen.render()
        }
    }

    #registerEvents(eventEmitter, components) {
        eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
        eventEmitter.on(constants.events.app.ACTIVITY_LOG_UPDATED, this.#onLogChanged(components))
        eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChanged(components))
    }

    async initializeTable(eventEmitter) {
        const components = new ComponentsBuilder()
            .setScreen({ title: "HackerChat - Bruno Oliveira" })
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmitter))
            .setChatComponent()
            .setActivityLogComponent()
            .setStatusComponent()
            .build()

        this.#registerEvents(eventEmitter, components)
        components.input.focus()
        components.screen.render()

        setInterval(() => {
            eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, { message: "hey", userName: "Bruno" })
            eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, { message: "ho", userName: "Ellen" })
            eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, { message: "oi", userName: "Julia" })
            eventEmitter.emit(constants.events.app.MESSAGE_RECEIVED, { message: "olá", userName: "Evellyn" })

            eventEmitter.emit(constants.events.app.ACTIVITY_LOG_UPDATED, 'Bruno join')
            eventEmitter.emit(constants.events.app.ACTIVITY_LOG_UPDATED, 'Ellen left')

            const users = ['Bruno']
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('Ellen')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
            users.push('Maria')
            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users)
        }, 1000);
    }
}
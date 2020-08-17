import Dashx from './dashx'

export default ({ publicKey }: { publicKey: string }): Dashx => new Dashx({ publicKey })

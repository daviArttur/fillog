import  amqp from 'amqplib';

interface Config {
  queueName: string,
  user: string,
  pass: string,
  host: string,
  port: string,
}

type ISOString = string

interface EmitEvent {
  status: number,
  path: string,
  time: ISOString,
  message: string
}

class Logger {
  constructor(private channel: amqp.Channel, private queueName: string) {}

  public emit(input: EmitEvent) {
    this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(input)));
  }
}

class Publisher {
  constructor(private config: Config) {}

  public async connect(): Promise<Logger> {
    const connection = await amqp.connect(`amqp://${this.config.user}:${this.config.pass}@${this.config.host}:${this.config.port}`);
    const channel = await connection.createChannel();
    this.listener(channel)
    return new Logger(channel, this.config.queueName);
  }

  private listener(channel: amqp.Channel) {
    channel.consume(this.config.queueName, (msg) => {
      if (msg) {
        console.log(msg.content.toString())
      }
    })
  }
}



async function main() {
  const logger = await new Publisher({
    user: "root",
    pass: "root",
    port: "5672",
    host: "localhost",
    queueName: "test"
  }).connect();
  
  setInterval(() => {
    logger.emit({ message: "not found", path: "/users", status: 400, time: new Date().toISOString()})
  }, 1000)
}
main()
// async function main() {
//   const queue = "test";
//   const connection = await amqp.connect('amqp://root:root@localhost:5672');

//   const channel = await connection.createChannel()
//   await channel.assertQueue(queue);

//   channel.consume(queue, (msg) => {
//     console.log(msg?.content.toString())
//   });

//   const ch2 = await connection.createChannel();

//   setInterval(() => {
//     ch2.sendToQueue(queue, Buffer.from('something to do'));
//   }, 1000);
// }

// main();
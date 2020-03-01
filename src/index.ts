import { promisify } from "util";
import { exec as execCb } from "child_process";
const exec = promisify(execCb);

class DockerInstance {
  constructor(private containerId: string) {}

  async copyToHost(src: string, dest: string) {
    await exec(`docker cp ${this.containerId}:${src} ${dest}`);
  }
  async copyToContainer(src: string, dest: string) {
    await exec(`docker cp ${src} ${this.containerId}:${dest}`);
  }
  async exec(command: string, commandArgs: string[]) {
    await exec(`docker exec ${this.containerId} ${command} ${commandArgs.map(quote).join(" ")}`);
  }
}
export class Docker {
  async withContainerFromImage(image: string, worker: (docker: DockerInstance) => Promise<void>) {
    const { stdout } = await exec(`docker run -tid --rm ${image} bash`);
    const containerId = stdout.trim();
    await worker(new DockerInstance(containerId));
    await exec(`docker stop ${containerId}`);
  }
}

function quote(value: string): string {
  // tslint:disable-next-line: quotemark
  return `"${value.replace(/\"/g, '\\"')}"`;
}

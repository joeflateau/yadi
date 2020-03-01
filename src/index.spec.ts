import { describe, it } from "mocha";
import { expect } from "chai";
import { Docker } from ".";
import { pathExists, mkdirp } from "fs-extra";

describe("docker", () => {
  it("should create a container and execute a script", async function() {
    this.timeout("60s");
    const docker = new Docker();
    await docker.withContainerFromImage(
      "lambci/lambda:build-nodejs12.x",
      async container => {
        await container.copyToContainer("./package.json", `/var/task/`);
        await container.exec("/bin/bash", [
          "-c",
          `echo foo > /var/task/foo.txt`
        ]);
        await mkdirp("./test-results");
        await container.copyToHost(
          `/var/task/foo.txt`,
          `./test-results/foo.txt`
        );
      }
    );
    expect(await pathExists("./test-results/foo.txt")).to.equal(true);
  });
});

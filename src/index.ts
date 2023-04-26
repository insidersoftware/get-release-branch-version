import * as core from '@actions/core';
import * as github from '@actions/github';

const getVersion = async (version: string): Promise<Version> => {
    const numbers = version.split('.');
    console.log("numbers:", numbers);
    return {
        major: parseInt(numbers[0]),
        minor: parseInt(numbers[1]),
        manifestSafeVersionString:
            numbers[0].padStart(2, "0") + "." +
            numbers[1].padStart(2, "0")
    };
}

async function run() {
    try {
        const refType = github.context.payload.ref_type;
        if (refType !== "branch"){
            core.setFailed("This action is only meant to be run on the creation of a new branch");
            return;
        }

        // Grab the branch version
        const branchName: string = github.context.payload.ref;
        const regex = new RegExp(/^(release|prerelease)\/\d{1,2}\.\d{1,2}$/);
        if (branchName.match(regex)){
            const versionString = branchName.split('/')[1];
            const version = await getVersion(versionString);
            console.log("version: ", version);
            core.setOutput("major", version.major);
            core.setOutput("minor", version.minor);
            core.setOutput("manifestSafeVersionString", version.manifestSafeVersionString);
        }
        else{
            core.setFailed("the branch name does not match the patter '(pre)release/nn.nn'");
        }
    } catch (error) {
        core.setFailed(error);
    }
}

run();

interface Version {
    major: number,
    minor: number,
    manifestSafeVersionString: string
}

export default run;

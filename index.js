"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("@risecorejs/helpers");
const execa_1 = __importDefault(require("execa"));
/**
 * PROCESSES-RUNNER
 * @param processes {IProcesses}
 * @return {Promise<void>}
 */
async function default_1(processes) {
    const state = {
        modes: ['dev', 'prod', 'default'],
        processes: {
            dev: [],
            prod: [],
            default: []
        }
    };
    for (const [, processOptions] of Object.entries(processes)) {
        for (const mode of state.modes) {
            const processOptionsMode = processOptions[mode];
            if (processOptionsMode) {
                state.processes[mode].push({
                    cmd: getParsedCMD(processOptionsMode.cmd, processOptions.vars),
                    await: Boolean(processOptionsMode.await)
                });
            }
        }
    }
    switch ((0, helpers_1.env)('NODE_ENV')) {
        case 'development':
            await runProcesses(state.processes.dev);
            break;
        case 'production':
            await runProcesses(state.processes.prod);
            break;
        default:
            await runProcesses(state.processes.default);
            break;
    }
}
exports.default = default_1;
/**
 * GET-PARSED-CMD
 * @param cmd {string}
 * @param vars {object | undefined}
 * @return {string}
 */
function getParsedCMD(cmd, vars) {
    if (vars) {
        for (const [key, value] of Object.entries(vars)) {
            cmd = cmd.replaceAll(new RegExp(`{{(?:\\s|)${key}(?:\\s|)}}`, 'g'), value);
        }
    }
    return cmd;
}
/**
 * RUN-PROCESSES
 * @param processes {IProcessOptions[]}
 * @return {Promise<void>}
 */
async function runProcesses(processes) {
    for (const process of processes) {
        if (process.await) {
            await runExeca(process.cmd);
        }
        else {
            runExeca(process.cmd).then();
        }
    }
}
/**
 * RUN-EXECA
 * @param cmd {string}
 * @return {Promise<any>}
 */
function runExeca(cmd) {
    return (0, execa_1.default)(cmd, {
        stdin: process.stdin,
        stdout: process.stdout,
        stderr: process.stderr,
        shell: true
    }).catch((err) => console.error(err));
}

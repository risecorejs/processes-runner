import { env } from '@risecorejs/helpers'
import execa from 'execa'

import { IProcesses, IState, IProcessOptions } from './interfaces'

/**
 * PROCESSES-RUNNER
 * @param processes {IProcesses}
 * @return {Promise<void>}
 */
export default async function (processes: IProcesses): Promise<void> {
  const state: IState = {
    modes: ['dev', 'prod', 'default'],
    processes: {
      dev: [],
      prod: [],
      default: []
    }
  }

  for (const [, processOptions] of Object.entries(processes)) {
    for (const mode of state.modes) {
      const processOptionsMode = processOptions[mode]

      if (processOptionsMode) {
        state.processes[mode].push({
          cmd: getParsedCMD(processOptionsMode.cmd, processOptions.vars),
          await: Boolean(processOptionsMode.await)
        })
      }
    }
  }

  switch (env('NODE_ENV')) {
    case 'development':
      await runProcesses(state.processes.dev)
      break

    case 'production':
      await runProcesses(state.processes.prod)
      break

    default:
      await runProcesses(state.processes.default)
      break
  }
}

/**
 * GET-PARSED-CMD
 * @param cmd {string}
 * @param vars {object | undefined}
 * @return {string}
 */
function getParsedCMD(cmd: string, vars: object | undefined) {
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      cmd = cmd.replaceAll(new RegExp(`{{(?:\\s|)${key}(?:\\s|)}}`, 'g'), value)
    }
  }

  return cmd
}

/**
 * RUN-PROCESSES
 * @param processes {IProcessOptions[]}
 * @return {Promise<void>}
 */
async function runProcesses(processes: IProcessOptions[]) {
  for (const process of processes) {
    if (process.await) {
      await runExeca(process.cmd)
    } else {
      runExeca(process.cmd).then()
    }
  }
}

/**
 * RUN-EXECA
 * @param cmd {string}
 * @return {Promise<any>}
 */
function runExeca(cmd: string) {
  return execa(cmd, {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
    shell: true
  }).catch((err) => console.error(err))
}

import env from '@risecorejs/helpers/lib/env'
import execa from 'execa'

import { IProcesses, IState, IProcessOptions } from './interfaces'

/**
 * PROCESSES-RUNNER
 * @param processes {IProcesses}
 */
export default async function (processes: IProcesses) {
  const state: IState = {
    modes: ['dev', 'prod', 'default'],
    processes: {
      dev: [],
      prod: [],
      default: []
    }
  }

  for (const [, process] of Object.entries(processes)) {
    for (const mode of state.modes) {
      const processOptions = process[mode]

      if (processOptions) {
        state.processes[mode].push({
          cmd: getParsedCMD(processOptions.cmd, process.vars),
          await: Boolean(processOptions.await)
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
function getParsedCMD(cmd: string, vars: object | undefined): string {
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
function runExeca(cmd: string): Promise<any> {
  return execa(cmd, {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
    shell: true
  }).catch((err) => console.error(err))
}

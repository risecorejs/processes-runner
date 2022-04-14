const env = require('@risecorejs/helpers/lib/env')
const execa = require('execa')

module.exports = async (processes) => {
  const state = {
    modes: ['dev', 'prod', 'default'],
    processes: {
      dev: [],
      prod: [],
      default: []
    }
  }

  for (const [, processOptions] of Object.entries(processes)) {
    for (const mode of state.modes) {
      if (processOptions[mode]) {
        const process = {
          cmd: getParsedCMD(processOptions[mode].cmd, processOptions.vars),
          await: Boolean(processOptions[mode].await)
        }

        state.processes[mode].push(process)
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
 * @param vars {Object}
 * @return {string}
 */
function getParsedCMD(cmd, vars) {
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      cmd = cmd.replaceAll(new RegExp(`{{(?:\\s|)${key}(?:\\s|)}}`, 'g'), value)
    }
  }

  return cmd
}

/**
 * RUN-PROCESSES
 * @param processes {Array<{
 *   await: boolean,
 *   cmd: string
 * }>}
 * @return {Promise<void>}
 */
async function runProcesses(processes) {
  for (const process of processes) {
    if (process.await) {
      await runExeca(process.cmd)
    } else {
      runExeca(process.cmd)
    }
  }
}

/**
 * RUN-EXECA
 * @param cmd {string}
 * @return {Promise<execa.ExecaReturnValue<string> | void>}
 */
function runExeca(cmd) {
  return execa(cmd, {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
    shell: true
  }).catch((err) => console.error(err))
}

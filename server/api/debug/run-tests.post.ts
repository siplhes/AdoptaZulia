import { defineEventHandler } from 'h3'
import { spawn } from 'child_process'

export default defineEventHandler(async (event) => {
  // Security Check: Only allow in Dev mode
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: 'Test execution is disabled in production',
      rawOutput: '',
    }
  }

  return new Promise((resolve) => {
    // On Windows, we need shell: true for npx to work correctly
    const child = spawn('npx', ['vitest', 'run', '--reporter=verbose'], {
      cwd: process.cwd(),
      env: process.env,
      shell: true, // Required for Windows
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        rawOutput: stdout || stderr || 'No output',
        errorOutput: stderr,
        error: code !== 0 ? `Test exited with code ${code}` : null,
      })
    })

    child.on('error', (err) => {
      resolve({
        success: false,
        error: err.message,
        rawOutput: `Error: ${err.message}`,
        errorOutput: stderr,
      })
    })
  })
})

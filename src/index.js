const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    const userSuppliedPrId = core.getInput('pr-id')
    const token = core.getInput('repo-token')
    console.log('PR ID: %s', userSuppliedPrId)

    const prNumber = getPrNumber(userSuppliedPrId)

    if (!prNumber) {
      core.setFailed(
        'Pull request number was neither set by user nor obtainable by context',
      )
    } else {
      console.log('PR Number: %s', prNumber)
    }

    if (!token) {
      console.warn('No token provided, might not work')
    }
    const octokit = github.getOctokit(token)
    console.log('octokit created')

    const response = await octokit.rest.pulls.get({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: prNumber,
    })

    core.setOutput('branch', response.data.head.ref)
    console.log(
      'pull request %s is from the branch %s',
      prNumber,
      response.data.head.ref,
    )
  } catch (error) {
    console.error('get-branch-name-by-pr')
    console.error('Caught an error!')
    console.error(error)

    core.error(error)
    core.setFailed(error.message)
  }
}

function getPrNumber(userSuppliedPrId) {
  if (isNaN(userSuppliedPrId)) {
    if (!github.context.payload.pull_request) {
      return undefined
    }
    return github.context.payload.pull_request.number
  } else {
    return userSuppliedPrId
  }
}

run()

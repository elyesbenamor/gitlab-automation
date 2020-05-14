require('dotenv').config()
//var MY_SLACK_WEBHOOK_URL = 'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=token';
//var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);
const inquirer = require('inquirer');
const GitlabApi = require('./api');
const gitlabApi = new GitlabApi(process.env.TOKEN);
const main = async () => {
	try {
		// 1 - 
		const projects = await gitlabApi.getProjects();
		const projectsChoices = projects.map((project) => { return { name: ' ' + project.name, value: project.id } })
		const { selectedProjectId } = await inquirer.prompt(
			{
				type: 'list',
				message: 'Select a project',
				name: 'selectedProjectId',
				choices: projectsChoices
			}
		)

		// 2
		const labels = await gitlabApi.getLabelsByProjectId(selectedProjectId);
		const labelsChoices = labels.map((label) => { return { name: ' ' + label.name, value: label.name } })
		const { selectedlabels } = await inquirer.prompt(
			{
				type: 'checkbox',
				message: 'Select labels',
				name: 'selectedlabels',
				choices: labelsChoices
			}
		)

		// 3 -
		const issues = await gitlabApi.getIssuesBefore24h(GitlabApi.states.OPENED, selectedlabels);
		const issuesChoices = issues.map((issue) => { return { name: ' ' + issue.title, value: issue.iid } })
		const { selectedIssueIid } = await inquirer.prompt(
			{
				type: 'list',
				message: 'Select an Issue to close',
				name: 'selectedIssueIid',
				choices: issuesChoices
			}
		)

		const {isConfirmed} = await inquirer.prompt(
			{
				type: 'confirm',
				message: 'Do you confirm ?',
				name: 'isConfirmed',
			}
		)
		console.log(selectedIssueIid, selectedProjectId, isConfirmed);
			 alert = slack.alert({
				text: 'sending alert from gitlab',
				attachments: [
					{
						fallback: 'closing issues',
						fields: [
							{ title: 'issue params', value: result.selectedIssueIid, short: true }
						]
					}
				]
			});

		if(isConfirmed){
			const result = await gitlabApi.closeIssue(selectedProjectId, selectedIssueIid);
			console.log('result', result);
			if (result === 'closed'){
				 send = slack.send({
					channel: '#myCustomChannelName',
					text: 'sending alert for closed issures'
				});
			}
		}	

	} catch (err) {
		console.log('error', err);
	}
}
main();
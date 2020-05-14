require('dotenv').config()

//let list = [];
const GitlabApi = require('./api');

const gitlabApi = new GitlabApi(process.env.TOKEN);
(async () => {
	try {
		/const results = await gitlabApi.getLabelsByProjectId(17939843)
		const projects = await gitlabApi.getProjects();
		

    } catch (err) {
			console.log('Error ', err)
	}
})()
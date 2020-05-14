const got = require('got');
const day = 24 * 60 * 60 * 1000;
const qs = require('querystring');

class GitlabApi {
	static states = {
		OPENED: 'opened',
		CLOSED: 'closed'
	}

	static baseUrl = 'http://gitlab.com/api/v4';

	static endpoints = {
		getIssues: {
			method: 'get',
			path: '/issues'
		},
		getLabelsByProjectId: {
			method: 'get',
			path: '/projects/{{id}}/labels'
		},
		getProjects: {
			method: 'get',
			path: '/projects'
		},
		putIssue: {
			method: 'put',
			path: '/projects/{{id}}/issues/{{issue_iid}}'
		}
	}


	constructor(apiKey) {
		this.apiKey = apiKey;
		// Inject token in headers
		this.headers = {
			"Private-Token": this.apiKey
		}
	}

	execRequest(method, path, params = null, data = null) {
		return new Promise(async (resolve, reject) => {
			try {
				// Create headers
				const headers = this.headers;
				// Create endpoint
				const endpoint = GitlabApi.baseUrl + path;
				// 
				const config = {
					headers: headers,
				};

				if (method === 'get') {
					config.params = params;
					const enpointParams = params ? `${endpoint}?${qs.stringify(params)}`: endpoint;
					const results = await got(enpointParams, config)
					return resolve(JSON.parse(results.body));
				}
				if(method === 'put'){

					const enpointParams = params ? `${endpoint}?${qs.stringify(params)}`: endpoint;
					const results = await got.put(enpointParams, config)
					return resolve(JSON.parse(results.body));
				}

				return resolve();
			} catch (err) {
				return reject(err);
			}
		})
	}


	createLabelsStr(labelsArr) {
		return labelsArr ? labelsArr.join(',') : '';
	}

	getIssuesBefore24h(state, labelsArr) {
		//console.log(labelsArr);
		const dateBefore24h = new Date(new Date().getTime() - day);
		const path = GitlabApi.endpoints.getIssues.path;
		const method = GitlabApi.endpoints.getIssues.method;
		const params = {
			state: state,
			created_before: dateBefore24h,
			labels: this.createLabelsStr(labelsArr)
		}
		return Promise.resolve(this.execRequest(method, path, params, null));
	}

	getLabelsByProjectId(projectId){
		const path = GitlabApi.endpoints.getLabelsByProjectId.path.replace('{{id}}', projectId);
		const method = GitlabApi.endpoints.getLabelsByProjectId.method;
		return Promise.resolve(this.execRequest(method, path));
	}

	getProjects(){
		const path = GitlabApi.endpoints.getProjects.path;
		const method = GitlabApi.endpoints.getProjects.method;
		const params = {
			with_issues_enabled: true,
			owned: true
		}

		return Promise.resolve(this.execRequest(method, path, params, null));
	}

	closeIssue(projectId, issueIid){
		const path = GitlabApi.endpoints.putIssue.path.replace('{{id}}', projectId).replace('{{issue_iid}}', issueIid);
		const method = GitlabApi.endpoints.putIssue.method;
		const params = {
			state_event: 'close'
		}

		return Promise.resolve(this.execRequest(method, path, params, null));

	}

}
module.exports = GitlabApi;


const { availableTeams } = require('../../eleventy/lib/utils');

module.exports = async function () {
	return availableTeams('cfb');
};

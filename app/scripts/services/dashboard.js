'use strict';

app.service('Dashboard', [
    '$rootScope',
    'Config',
    'Github',
    'Jira',
    function($rootScope, Config, Github, Jira) {
        var service = {
            init: function() {
                var self = this;

                if (Config.isInitialized()) {
                    Config.initialize();
                }

                if (!Config.isValid()) {
                    Config.showConfigModal();
                } else {
                    self.updateOrganization();
                }

                $rootScope.$on('configuration.updated', function() {
                    self.updateOrganization();
                })
            },
            updateOrganization: function() {
                Github.getOrganization(Config.getConfig('organizationName')).then(function(org) {
                    $rootScope.org = org;
                    $rootScope.$emit('organization.updated', org);
                });

                // Jira.getProject(
                //     Config.getConfig('jiraProjectName')
                // ).then(function(project) {
                //     console.log(project);
                //     $rootScope.project = project;
                // });

                Jira.getProjects().then(function(projects) {
                    console.log(projects);
                    $rootScope.projects = projects;
                });
            }
        };

        $rootScope.$on('organization.updated', function(event, organization) {
            Github.getTopContributors(organization.login).then(function(top) {
                $rootScope.$emit('topcontributors.updated', top);
                $rootScope.topContributors = top;
            });

            Github.getRepo(Config.getConfig('repoName')).then(function(repo) {
                $rootScope.$emit('repository.updated', repo);
                $rootScope.repo = repo;
            });

            Jira.getFastTrack(Config.getConfig('jiraProjectName'), Config.getConfig('jiraProjectVersion')).then(function(fasttrack) {
                $rootScope.$emit('fasttrack.updated', fasttrack);
                $rootScope.fasttrack = fasttrack;
            });
        });

        $rootScope.$on('repository.updated', function(event, repository) {
            Github.getPullRequests(repository);
        });

        return service;
    }
]);


'use strict';

app.service('Github', [
    '$rootScope',
    '$q',
    'HybridStorage',
    'Routing',
    'Travis',
    'Scrutinizer',
    'Jenkins',
    function($rootScope, $q, HybridStorage, Routing, Travis, Scrutinizer, Jenkins) {
        var config = {
            'routes': {
                'repo': {
                    'url': 'http://localhost:8000/github/repos/::repoName::'
                }
            },
        };

        var service = {
            config: config,
            getOrganization: function(organizationName) {
                return HybridStorage.getResource('orgs', {'organizationName': organizationName});
            },
            getRepos: function(org) {
                var deferred = $q.defer();

                HybridStorage.get(org.repos_url).then(function(repos) {
                    deferred.resolve(repos);
                });

                return deferred.promise;
            },
            getRepo: function(repoName) {
                var deferred = $q.defer();

                var url = Routing.mapParamsToRoute(this.config.routes.repo.url, {'repoName': repoName});

                HybridStorage.get(url).then(function(repo) {
                    var promises = [];

                    promises.push(HybridStorage.get(Routing.clean(repo.pulls_url)).then(function(pulls) {
                        var pullPromises = [];

                        for (var pull in pulls) {
                            (function(pull) {
                                pullPromises.push(HybridStorage.get(Routing.clean(pulls[pull].review_comments_url)).then(function(reviews) {
                                    pulls[pull].reviews = reviews;
                                }));
                            })(pull);

                            (function(pull) {
                                pullPromises.push(HybridStorage.get(Routing.clean(pulls[pull].comments_url)).then(function(comments) {
                                    pulls[pull].comments = comments;
                                }));
                            })(pull);

                            (function(pull) {
                                pullPromises.push(Travis.getPullRequestStatus(repoName, pulls[pull].number).then(function(build) {
                                    console.log(build);
                                    pulls[pull].travisBuild = build;
                                }));
                            })(pull);

                            (function(pull) {
                                pullPromises.push(Jenkins.getPullRequestStatus(pulls[pull].number).then(function(build) {
                                    pulls[pull].behatBuild = build;
                                }));
                            })(pull);
                        }

                        $q.all(pullPromises).then(function() {
                            repo.pulls = pulls;
                        });
                    }));
                    promises.push(HybridStorage.get(Routing.clean(repo.commits_url)).then(function(commits) {
                        repo.commits = commits;
                    }));

                    $q.all(promises).then(function(){
                        deferred.resolve(repo);
                    });

                });

                return deferred.promise;
            },
            getBranches: function(repo) {
                var org = {};
                var deferred = $q.defer();

                HybridStorage.get(repo.branches_url).then(function(branches) {
                    deferred.resolve(branches);
                });

                return deferred.promise;
            },
            getCommitsByRepo: function(repo) {
                var org = {};
                var deferred = $q.defer();

                HybridStorage.get(repo.commits_url).then(function(commits) {
                    deferred.resolve(commits);
                });

                return deferred.promise;
            },
            getTopContributors: function(org) {
                var self = this;
                var deferred = $q.defer();
                var promises = [];
                var contributors = {};
                var topContributors = [];

                this.getRepos(org).then(function(repos) {
                    var lastCommits = [];

                    for (var i = repos.length - 1; i >= 0; i--) {
                        promises.push(self.getCommitsByRepo(repos[i]).then(function(commits) {
                            lastCommits = lastCommits.concat(commits);
                        }));
                    }

                    $q.all(promises).then(function() {
                        var author;

                        for (var i = lastCommits.length - 1; i >= 0; i--) {
                            author = lastCommits[i].author;
                            if (typeof contributors[author.login] == 'undefined') {
                                contributors[author.login] = {'commitCount': 0, 'author': author};
                            } else {
                                contributors[author.login].commitCount++;
                            }
                        };

                        for (var i in contributors) {
                            topContributors.push(contributors[i]);
                        };

                        deferred.resolve(topContributors);
                    });
                });

                return deferred.promise;
            }
        };

        return service;
    }
]);
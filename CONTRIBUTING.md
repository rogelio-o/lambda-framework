#Community Contributing Guide

This document describes a very simple process suitable to contribute in lambda-framework project.

The goal of this document is to create a contribution process that:
- Encourages new contributions.
- Encourages new contributions.
- Avoids unnecessary processes and bureaucracy whenever possible.
- Creates a transparent decision-making process which makes it clear how contributors can be involved in decision-making.

## Vocabulary

- A **Contributor** is any individual creating or commenting on an issue or pull request.
- A **Committer** is a subset of contributors who have been given write access to the repository.

## Logging Issues

Log an issue for any problem you might have. When in doubt, log an issue, any additional policies about what to include will be provided in the responses.

Committers may direct you to another repository, ask for additional clarifications, and add appropriate info before the issue is addressed.

## Contributions

Any change must be through pull requests. This applies to all changes to documentation, code, binary files, etc. Even long term committers must use pull requests.

No pull request can be merged without being reviewed. All the PR are merged with `develop` branch and reviewed before the package version is changed and merged with the `master` branch. Contributors have to fork the repo, create a branch, develop the feature and ask for merge the forked branch with `develop`.

Long term committers also cannot push directly into `master` branch, the have to push in at least in the `develop` branch but it is preferable to use a `feature` branch before to use `develop`. So, all the commits have to be checked in `develop`.

When a branch is merged with `master` the new features are deployed into the NPM repository.

Pull requests should sit for at least 72 hours to ensure that contributors have time to review. Consideration should also be given to weekends and other holiday periods to ensure active committers all have reasonable time to become involved in the discussion and review process if they wish.

The default for each contribution is that it is accepted once no committer has an objection. During review committers may also request that a specific contributor who is most versed in a particular area gives a "LGTM" before the PR can be merged.

Once all issues brought by committers are addressed it can be landed by any committer.

In the case of an objection being raised in a pull request by another committer, all involved committers should seek to arrive at a consensus by way of addressing concerns being expressed by discussion, compromise on the proposed change, or withdrawal of the proposed change.

## Becoming a Contributor

Becoming a contributor to the project should be an easy step. In order to reduce that barrier new contributors should look for issues tagged as:

- `Quick Win`
- `Help Wanted`

These tags should be applied to issues that are relatively simple to fix but not critical to be handled by the current group of committers. Once you pick such an issue to work on a discussion with a committer should happen on the issue itself and the committer should guide you with the mentoring/onboarding process.

## Becoming a Committer

All contributors who land a non-trivial contribution should be on-boarded in a timely manner, and added as a committer, and be given write access to the repository.

Committers are expected to follow this policy and continue to send pull requests, go through proper review, and have other committers merge their pull requests.

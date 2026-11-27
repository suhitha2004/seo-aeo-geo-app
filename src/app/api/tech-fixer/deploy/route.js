import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { githubRepo, githubToken, prNumber } = await req.json();

        if (!githubRepo || !prNumber) {
            return NextResponse.json(
                { error: 'GitHub repository (owner/repo) and PR number are required for deployment.' },
                { status: 400 }
            );
        }

        const token = githubToken || process.env.GITHUB_TOKEN;
        if (!token) {
            return NextResponse.json(
                {
                    error:
                        'GitHub token is required to merge the pull request. Provide it in the request or set GITHUB_TOKEN in .env.',
                },
                { status: 401 }
            );
        }

        const parts = githubRepo.trim().split('/');
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            return NextResponse.json(
                { error: 'Invalid GitHub repository format. Use "owner/repo" (e.g., suhitha2004/seo-aeo-geo-app).' },
                { status: 400 }
            );
        }

        const [owner, repo] = parts;
        const mergeUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/merge`;

        const response = await fetch(mergeUrl, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token.trim()}`,
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'TrifectaTechFixer/2.0',
            },
            body: JSON.stringify({
                commit_title: `Merge pull request #${prNumber} from Trifecta Auto Tech Fixer`,
                commit_message: 'Approved technical SEO, AEO, and GEO optimization patches via human-in-the-loop permission gate.',
                merge_method: 'merge',
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error:
                        data.message ||
                        `GitHub merge failed with status ${response.status}. Ensure the PR is not conflicted and the token has 'repo' write permissions.`,
                    details: data,
                },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            merged: data.merged !== false,
            sha: data.sha,
            message:
                data.message ||
                `Pull request #${prNumber} successfully merged into production branch. Vercel production deployment initiated.`,
            prNumber,
            repo: `${owner}/${repo}`,
        });
    } catch (err) {
        console.error('Tech Fixer Deploy Error:', err);
        return NextResponse.json(
            { error: err.message || 'Deployment approval failed.' },
            { status: 500 }
        );
    }
}

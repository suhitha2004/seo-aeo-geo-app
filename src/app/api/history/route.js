import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                audits: {
                    orderBy: { createdAt: 'desc' },
                },
                geoChecks: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('History fetch error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to load saved history from database.' },
            { status: 500 }
        );
    }
}
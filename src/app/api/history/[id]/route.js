import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request, context) {
    try {
        const { id } = await context.params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'project'; // 'project' | 'audit' | 'geocheck'

        if (!id) {
            return NextResponse.json({ error: 'Record ID is required.' }, { status: 400 });
        }

        if (type === 'audit') {
            await prisma.auditReport.delete({ where: { id } });
        } else if (type === 'geocheck') {
            await prisma.geoCheck.delete({ where: { id } });
        } else {
            await prisma.project.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete record error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete record from database.' },
            { status: 500 }
        );
    }
}
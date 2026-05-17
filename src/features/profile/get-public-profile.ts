import type { UserType } from "@prisma/client";
import { prisma } from "@/lib/db";

export type PublicProfile = {
  fullName: string;
  userType: UserType;
  domain: string;
  college: string | null;
  graduationYear: number | null;
  organization: string | null;
  role: string | null;
  yearsExperience: number | null;
  skills: string[];
  linkedinUrl: string | null;
  githubUsername: string | null;
  joinedAt: Date;
  daysCompleted: number;
  currentStreak: number;
  longestStreak: number;
  isReadyForInterview: boolean;
};

export async function getPublicProfile(
  userId: string,
): Promise<PublicProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      studentProfile: {
        select: {
          fullName: true,
          userType: true,
          domain: true,
          college: true,
          graduationYear: true,
          organization: true,
          role: true,
          yearsExperience: true,
          skills: true,
          linkedinUrl: true,
          githubUsername: true,
          isReadyForInterview: true,
        },
      },
      enrollments: {
        where: { status: { not: "ABANDONED" } },
        orderBy: { startedAt: "desc" },
        take: 1,
        select: {
          daysCompleted: true,
          currentStreak: true,
          longestStreak: true,
        },
      },
    },
  });

  if (!user?.studentProfile) {
    return null;
  }

  const latestEnrollment = user.enrollments[0];
  const p = user.studentProfile;

  return {
    fullName: p.fullName,
    userType: p.userType,
    domain: p.domain,
    college: p.college,
    graduationYear: p.graduationYear,
    organization: p.organization,
    role: p.role,
    yearsExperience: p.yearsExperience,
    skills: p.skills,
    linkedinUrl: p.linkedinUrl,
    githubUsername: p.githubUsername,
    joinedAt: user.createdAt,
    daysCompleted: latestEnrollment?.daysCompleted ?? 0,
    currentStreak: latestEnrollment?.currentStreak ?? 0,
    longestStreak: latestEnrollment?.longestStreak ?? 0,
    isReadyForInterview: p.isReadyForInterview,
  };
}

export async function getPublicEnrollmentId(userId: string): Promise<string | null> {
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId, status: { not: "ABANDONED" } },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });

  return enrollment?.id ?? null;
}

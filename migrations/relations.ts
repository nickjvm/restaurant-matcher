import { relations } from "drizzle-orm/relations";
import { sessions, matches, users, sessionUsers, votes } from "./schema";

export const matchesRelations = relations(matches, ({one}) => ({
	session: one(sessions, {
		fields: [matches.sessionId],
		references: [sessions.sessionId]
	}),
}));

export const sessionsRelations = relations(sessions, ({many}) => ({
	matches: many(matches),
	sessionUsers: many(sessionUsers),
	votes: many(votes),
}));

export const sessionUsersRelations = relations(sessionUsers, ({one}) => ({
	user: one(users, {
		fields: [sessionUsers.userId],
		references: [users.id]
	}),
	session: one(sessions, {
		fields: [sessionUsers.sessionId],
		references: [sessions.sessionId]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	sessionUsers: many(sessionUsers),
	votes: many(votes),
}));

export const votesRelations = relations(votes, ({one}) => ({
	user: one(users, {
		fields: [votes.userId],
		references: [users.id]
	}),
	session: one(sessions, {
		fields: [votes.sessionId],
		references: [sessions.sessionId]
	}),
}));
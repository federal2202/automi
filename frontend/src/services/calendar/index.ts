/**
 * Google Calendar Service — public barrel
 *
 * Functional implementation of Google Calendar API interactions, split by
 * concern: request params, error handling, calendars/events endpoints, sync,
 * and the service factory/singleton.
 *
 * @description Pure functions for Google Calendar API calls using axios and TanStack Query
 * @author Frontend Agent 1
 * @version 1.0.0
 */

export * from './params'
export * from './errors'
export * from './calendars'
export * from './events'
export * from './mutations'
export * from './sync'
export * from './factory'

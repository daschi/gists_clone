-- event-based modeling
-- by the way, this kind of iterative approach towards a more event-based modeling is what i was trying to allude to in the seminar. really an `ItemPricing` is an event where we as a business have decided to change the price of something. thinking about these kinds of events from the beginning can lead to more abstract but more flexible and robust models.

-- What events are in this system and how might we model them?
-- revision event

-- commands: CRUD gists
-- queries:
  -- get latest version of gist
  -- get paginated versions of gist
  -- view a file from latest version
  -- view a file from versions
  -- list a gist's comments
  -- get count of gist's subscriptions
  -- get count of gist's stars
--
-- a gist has many revisions
-- a revision belongs to a gist
-- a gist references the most recent revision

-- a revision has many files
-- a file belongs to a revision

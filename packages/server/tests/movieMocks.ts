import { GraphQLScalarType, Kind } from 'graphql';
import { tgql } from '../src';
import type { InferResolverReturn } from '../src/schema-builder/types';

export const dateScalar = new GraphQLScalarType({
	name: 'Date',
	description: 'Date custom scalar type',
	serialize(value) {
		if (value instanceof Date) {
			return value.getTime(); // Convert outgoing Date to integer for JSON
		}
		throw Error('GraphQL Date Scalar serializer expected a `Date` object');
	},
	parseValue(value) {
		if (typeof value === 'number') {
			return new Date(value); // Convert incoming integer to Date
		}
		throw new Error('GraphQL Date Scalar parser expected a `number`');
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
			// Convert hard-coded AST string to integer and then to Date
			return new Date(parseInt(ast.value, 10));
		}
		// Invalid hard-coded value (not an integer)
		return null;
	},
});

enum Genre {
	SCIENCE_FICTION = 'SCIENCE_FICTION',
	WESTERN = 'WESTERN',
	ACTION = 'ACTION',
	ADVENTURE = 'ADVENTURE',
}

// const createMocks = () => {};

export const setupMovieTests = () => {
	const createMocks = () => {
		const cast: {
			id: string;
			name: string;
			birthdate: Date;
		}[] = [];
		cast.push({ id: 'favreau', name: 'Jon Favreau', birthdate: new Date(1966, 9, 19) });
		cast.push({ id: 'ford', name: 'Harrison Ford', birthdate: new Date(1942, 6, 13) });
		cast.push({ id: 'craige', name: 'Daniel Wroughton Craig', birthdate: new Date(1968, 2, 2) });
		cast.push({ id: 'downey', name: 'Robert Downey Jr.', birthdate: new Date(1965, 3, 4) });
		cast.push({ id: 'paltrow', name: 'Gwyneth Paltrow', birthdate: new Date(1972, 8, 27) });
		cast.push({ id: 'law', name: 'Jude Law', birthdate: new Date(1972, 11, 29) });

		const studios: InferResolverReturn<typeof Studio>[] = [];
		studios.push({ id: 'universal', name: 'Universal Pictures' });
		studios.push({ id: 'paramount', name: 'Paramount Pictures' });
		studios.push({ id: 'marvel', name: 'Marvel Studios' });
		studios.push({ id: 'warner', name: 'Warner Bros. Pictures' });

		const movieCast: { movieId: string; castMemberId: string; role: string; character?: string }[] = [];
		const movies: {
			id: string;
			title: string;
			genre: (keyof typeof Genre)[];
			studioId: string;
			releaseYear: number;
		}[] = [];

		movies.push({
			id: 'cowboys_aliens',
			title: 'Cowboys and Aliens',
			genre: [Genre.SCIENCE_FICTION, Genre.WESTERN, Genre.ACTION],
			studioId: 'universal',
			releaseYear: 2011,
		});
		movieCast.push({
			movieId: 'cowboys_aliens',
			castMemberId: 'ford',
			role: 'Actor',
			character: 'Colonel Woodrow Dolarhyde',
		});
		movieCast.push({ movieId: 'cowboys_aliens', castMemberId: 'craige', role: 'Actor', character: 'Jake Lonergan' });
		movieCast.push({ movieId: 'cowboys_aliens', castMemberId: 'favreau', role: 'Director' });

		movies.push({
			id: 'iron_man',
			title: 'Iron Man',
			genre: [Genre.SCIENCE_FICTION, Genre.ACTION],
			studioId: 'marvel',
			releaseYear: 2008,
		});
		movieCast.push({
			movieId: 'iron_man',
			castMemberId: 'favreau',
			role: 'Director/Actor',
			character: 'Happy Hogan',
		});
		movieCast.push({ movieId: 'iron_man', castMemberId: 'downey', role: 'Actor', character: 'Tony Stark' });
		movieCast.push({ movieId: 'iron_man', castMemberId: 'paltrow', role: 'Actor', character: 'Pepper Pots' });

		movies.push({
			id: 'sky_captain',
			title: 'Sky Captain and the World of Tomorrow',
			genre: [Genre.SCIENCE_FICTION, Genre.ACTION, Genre.ADVENTURE],
			studioId: 'paramount',
			releaseYear: 2004,
		});
		movieCast.push({ movieId: 'sky_captain', castMemberId: 'paltrow', role: 'Actor', character: 'Polly Perkins' });
		movieCast.push({ movieId: 'sky_captain', castMemberId: 'law', role: 'Actor', character: 'Joseph Sullivan' });

		movies.push({
			id: 'sherlock_holmes',
			title: 'Sherlock Holmes',
			genre: [],
			studioId: 'warner',
			releaseYear: 2009,
		});
		movieCast.push({
			movieId: 'sherlock_holmes',
			castMemberId: 'downey',
			role: 'Actor',
			character: 'Sherlock Holmes',
		});
		movieCast.push({ movieId: 'sherlock_holmes', castMemberId: 'law', role: 'Actor', character: 'Dr. John Watson' });

		return { cast, movies, movieCast, studios };
	};
	type Context = ReturnType<typeof createMocks>;

	const GenreEnum = tgql.enum('Genre', Object.keys(Genre) as (keyof typeof Genre)[]);

	const Movie = tgql.object('Movie', {
		id: tgql.id(),
		title: tgql.string(),
		genre: tgql.list(GenreEnum),
		studioId: tgql.string(),
		releaseYear: tgql.int(),
	});

	const CastMember = tgql.object('CastMember', {
		id: tgql.id(),
		name: tgql.string(),
		birthdate: tgql.scalar(dateScalar),
	});

	const Studio = tgql.object('Studio', {
		id: tgql.id(),
		name: tgql.string(),
	});

	Movie.fieldResolvers<Context>((builder) => ({
		cast: builder
			.fieldResolver()
			.returns(tgql.list(CastMember))
			.resolver(async ({ source: movie, context }) => {
				const associations = context.movieCast.filter((casting) => casting.movieId === movie.id);
				return context.cast.filter(
					(cast) => !!associations.find((association) => association.castMemberId === cast.id)
				);
			}),
		studio: builder
			.fieldResolver()
			.returns(Studio)
			.resolver(async ({ source: movie, context }) => {
				return context.studios.find((studio) => studio.id === movie.studioId) as (typeof context)['studios'][number];
			}),
	}));

	CastMember.fieldResolvers<Context>((builder) => ({
		movies: builder
			.fieldResolver()
			.returns(tgql.list(Movie))
			.resolver(async ({ source: castMember, context }) => {
				const associations = context.movieCast.filter((casting) => castMember.id === casting.castMemberId);
				return context.movies.filter((movie) => !!associations.find((association) => association.movieId === movie.id));
			}),
	}));

	const findMovie = async (id: string, context: Context) => {
		const movie = context.movies.find((i) => i.id === id);
		if (!movie) throw new Error('No movie with such id');
		return movie;
	};

	const findCastMember = async (id: string, context: Context) => {
		const cast = context.cast.find((i) => i.id === id);
		if (!cast) throw new Error('No cast member with such id');
		return cast;
	};

	const findStudio = async (id: string, context: Context) => {
		const studio = context.studios.find((i) => i.id === id);
		if (!studio) throw new Error('No studio member with such id');
		return studio;
	};

	const movie = tgql
		.query<Context>()
		.returns(Movie)
		.args({ id: tgql.id() })
		.resolver(async ({ args: { id }, context }) => findMovie(id, context));

	const movies = tgql
		.query<Context>()
		.returns(tgql.list(Movie))
		.resolver(async ({ context }) => Array.from(context.movies));

	const castMember = tgql
		.query<Context>()
		.returns(CastMember)
		.args({ id: tgql.id() })
		.resolver(async ({ args: { id }, context }) => findCastMember(id, context));

	const cast = tgql
		.query<Context>()
		.returns(tgql.list(CastMember))
		.resolver(async ({ context }) => Array.from(context.cast));

	const studio = tgql
		.query<Context>()
		.returns(Studio)
		.args({ id: tgql.id() })
		.resolver(async ({ args: { id }, context }) => findStudio(id, context));

	const studios = tgql
		.query<Context>()
		.returns(tgql.list(Studio))
		.resolver(async ({ context }) => Array.from(context.studios));

	return {
		createSchema: () => {
			const tgqlResolvers = tgql.registerResolvers({ movie, movies, castMember, cast, studio, studios });
			return tgqlResolvers;
		},
		createMocks,
	};
};

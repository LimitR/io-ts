import { pipe } from 'fp-ts/lib/pipeable'
import * as DE from '../../src/DecodeError'
import * as _ from '../../src/Decoder'
import * as FS from '../../src/FreeSemigroup'

declare const NumberFromString: _.Decoder<string, number>

//
// TypeOf
//

// $ExpectType number
export type TypeOfNumberFromString = _.TypeOf<typeof NumberFromString>

//
// InputOf
//

// $ExpectType string
export type InputOfNumberFromString = _.InputOf<typeof NumberFromString>

//
// literal
//

// $ExpectType Decoder<unknown, "A">
_.literal('A')

// $ExpectType Decoder<unknown, "A" | "B">
_.literal('A', 'B')

// $ExpectType Decoder<unknown, "A">
_.union(_.literal('A'))

// $ExpectType Decoder<unknown, "A" | "B">
_.union(_.literal('A'), _.literal('B'))

// $ExpectType Decoder<unknown, { a: "A"; }>
_.struct({
  a: _.literal('A')
})

// $ExpectType Decoder<unknown, { a: "A"; } & { b: "B"; }>
pipe(
  _.struct({
    a: _.literal('A')
  }),
  _.intersect(
    _.struct({
      b: _.literal('B')
    })
  )
)

import * as S from '../../src/Schemable'
declare const literal: <A extends readonly [L, ...ReadonlyArray<L>], L extends S.Literal = S.Literal>(
  ...values: A
) => _.Decoder<unknown, A[number]>
// $ExpectType Decoder<unknown, { a: "A"; }>
_.struct({
  a: literal('A')
})

//
// fromStruct
//

// $ExpectType Decoder<{ a: unknown; b: { c: string; }; }, { a: string; b: { c: number; }; }>
_.fromStruct({
  a: _.string,
  b: _.fromStruct({
    c: NumberFromString
  })
})

//
// struct
//

// $ExpectType Decoder<unknown, { a: string; b: { c: number; }; }>
_.struct({
  a: _.string,
  b: _.struct({
    c: _.number
  })
})

//
// fromPartial
//

// $ExpectType Decoder<Partial<{ a: unknown; b: Partial<{ c: unknown; }>; }>, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.fromPartial({
  a: _.string,
  b: _.fromPartial({
    c: _.number
  })
})

//
// partial
//

// $ExpectType Decoder<unknown, Partial<{ a: string; b: Partial<{ c: number; }>; }>>
_.partial({
  a: _.string,
  b: _.partial({
    c: _.number
  })
})

//
// fromArray
//

// $ExpectType Decoder<string[], number[]>
_.fromArray(NumberFromString)

//
// array
//

// $ExpectType Decoder<unknown, string[]>
_.array(_.string)

//
// fromRecord
//

// $ExpectType Decoder<Record<string, string>, Record<string, number>>
_.fromRecord(NumberFromString)

//
// record
//

// $ExpectType Decoder<unknown, Record<string, string>>
_.record(_.string)

//
// fromTuple
//

// $ExpectType Decoder<[unknown, string, unknown], [string, number, boolean]>
_.fromTuple(_.string, NumberFromString, _.boolean)

//
// tuple
//

// $ExpectType Decoder<unknown, [string, number, boolean]>
_.tuple(_.string, _.number, _.boolean)

//
// fromSum
//

// $ExpectType Decoder<{ _tag: unknown; a: unknown; } | { _tag: unknown; b: string; }, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.fromSum('_tag')({
  A: _.fromStruct({ _tag: _.literal('A'), a: _.string }),
  B: _.fromStruct({ _tag: _.literal('B'), b: NumberFromString })
})

//
// sum
//

const S1 = _.struct({ _tag: _.literal('A'), a: _.string })
const S2 = _.struct({ _tag: _.literal('B'), b: _.number })

// $ExpectType Decoder<unknown, { _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
_.sum('_tag')({ A: S1, B: S2 })
// $ExpectError
_.sum('_tag')({ A: S1, B: S1 })

//
// union
//

// $ExpectType Decoder<unknown, string | number>
_.union(_.number, _.string)

//
// mapLeftWithInput
//

// $ExpectType Decoder<unknown, number>
pipe(
  _.number,
  _.mapLeftWithInput((u) => FS.of(DE.leaf(u, 'not a number')))
)

//
// readonly
//

// $ExpectType Decoder<unknown, Readonly<{ a: string; }>>
_.readonly(
  _.struct({
    a: _.string
  })
)

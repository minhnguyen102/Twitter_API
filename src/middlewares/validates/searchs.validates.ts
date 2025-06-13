import { checkSchema } from "express-validator";
import { MediaTypeQuery, PeopleFollowQuery } from "~/constants/enums";
import { SEARCH_MESSAGE } from "~/constants/messages";
import { validate } from "~/utils/validation";

export const validateSearch = validate(
  checkSchema({
    content: {
      isString: {
        errorMessage: SEARCH_MESSAGE.CONTENT_MUST_BE_STRING
      }
    },
    mediaType: {
      optional: true,
      isIn: {
        options: [Object.values(MediaTypeQuery)],
        errorMessage: SEARCH_MESSAGE.MEIDA_TYPE
      }
    },
    peopleFollow: {
      optional: true,
      isIn: {
        options: [Object.values(PeopleFollowQuery)],
        errorMessage: SEARCH_MESSAGE.PEOPLE_FOLLOW
      }
    },
  })
)
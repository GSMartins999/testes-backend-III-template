import { ZodError } from "zod"
import { UserBusiness } from "../../src/business/UserBusiness"
import { LoginSchema } from "../../src/dtos/user/login.dto"
import { HashManagerMock } from "../mocks/HashManagerMock"
import { IdGeneratorMock } from "../mocks/IdGeneratorMock"
import { TokenManagerMock } from "../mocks/TokenManagerMock"
import { UserDatabaseMock } from "../mocks/UserDatabaseMock"
import { NotFoundError } from "../../src/errors/NotFoundError"
import { BadRequestError } from "../../src/errors/BadRequestError"

describe("Testando login", () => {
  const userBusiness = new UserBusiness(
    new UserDatabaseMock(),
    new IdGeneratorMock(),
    new TokenManagerMock(),
    new HashManagerMock()
  )

  test("deve gerar um token ao logar", async () => {
    const input = LoginSchema.parse({
      email: "fulano@email.com",
      password: "fulano123"
    })

    const output = await userBusiness.login(input)

    expect(output).toEqual({
      message: "Login realizado com sucesso",
      token: "token-mock-fulano"
    })
  })


  test("deve retornar erro caso e-mail não exista", async () => {
    expect.assertions(1)

    try {
      
      const input = LoginSchema.parse({
        email: "email-não-existente@email.com",
        password: "fulano123"
      })

      await userBusiness.login(input)

    } catch (error) {
      expect(error).toBeInstanceOf(ZodError)

      if(error instanceof BadRequestError){
        expect(error.message).toBe("'e-mail' não encontrado")
        expect(error.statusCode).toBe(404)
      }

      }
  })

  test("deve retornar um erro ao acessar o password", async () => {
    expect(async () => {
      const input = LoginSchema.parse({
        email: "fulano@email.com",
        password: "senha-incorreta"
      })  

        await userBusiness.login(input)

    }).rejects.toThrow(new BadRequestError("'email' ou 'password' incorretos"))
})

})

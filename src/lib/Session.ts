export class Session {
  private expiresOn!: number;

  constructor(
    private _accessToken: string,
    private readonly _refreshToken: string,
    expiresIn: number,
  ) {
    this._refreshToken = _refreshToken;
    this.newToken(_accessToken, expiresIn);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public newToken(accessToken: string, _expiresIn: number): void {
    this._accessToken = accessToken;
  }

  public get accessToken(): string {
    return this._accessToken;
  }

  public get refreshToken(): string {
    return this._refreshToken;
  }

  public hasToken(): boolean {
    return !!this._accessToken;
  }

  public isTokenExpired(): boolean {
    return this.expiresOn < Session.getCurrentEpoch();
  }

  public hasValidToken(): boolean {
    return this.hasToken() && !this.isTokenExpired();
  }

  private static getCurrentEpoch(): number {
    return Math.round(new Date().getTime() / 1000);
  }
}

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AdminAuthService } from "@/services/admin-auth.service";
import {
  ShopService,
  type ShopValidationResult,
} from "@/services/shop.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    role: "admin" as "admin" | "owner",
    // Owner 전용 필드
    phone: "",
    shop_id: "",
    business_license: "",
    business_name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [shopValidation, setShopValidation] =
    useState<ShopValidationResult | null>(null);
  const [isValidatingShop, setIsValidatingShop] = useState(false);

  // shop_id 실시간 검증
  useEffect(() => {
    if (formData.role === "owner" && formData.shop_id) {
      const timeoutId = setTimeout(async () => {
        setIsValidatingShop(true);
        const result = await ShopService.validateShopId(formData.shop_id);
        setShopValidation(result);
        setIsValidatingShop(false);
      }, 500); // 0.5초 debounce

      return () => clearTimeout(timeoutId);
    } else {
      setShopValidation(null);
    }
  }, [formData.shop_id, formData.role]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }

    // Full name validation
    if (formData.full_name.trim().length < 2) {
      setError("이름은 최소 2자 이상이어야 합니다.");
      return false;
    }

    // Owner 전용 필드 검증
    if (formData.role === "owner") {
      if (!formData.phone.trim()) {
        setError("전화번호는 필수입니다.");
        return false;
      }

      if (!formData.shop_id.trim()) {
        setError("매장 ID는 필수입니다.");
        return false;
      }

      // shop_id 검증 결과 확인
      if (!shopValidation?.valid) {
        setError(shopValidation?.error || "매장 ID를 확인해주세요.");
        return false;
      }
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { user, error } = await AdminAuthService.signUp({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        // Owner 전용 필드
        phone: formData.phone || undefined,
        shop_id: formData.shop_id || undefined,
        business_license: formData.business_license || undefined,
        business_name: formData.business_name || undefined,
      });

      if (error) {
        throw error;
      }

      if (user) {
        console.log("회원가입 성공:", user);

        // Sign out the user after signup (they were auto-logged in by Supabase)
        await AdminAuthService.signOut();

        setSuccess(true);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error("회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      setError(
        error instanceof Error ? error.message : "회원가입에 실패했습니다."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Gacha Store Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            관리자 회원가입
          </p>
        </div>

        {success ? (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="admin@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="full_name">이름</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="홍길동"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="role">역할</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    handleChange("role", value as "admin" | "owner")
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">관리자 (Admin)</SelectItem>
                    <SelectItem value="owner">사장님 (Owner)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  관리자: 전체 상점 관리 권한 / 사장님: 본인 상점만 관리
                </p>
              </div>

              {/* Owner 전용 필드들 */}
              {formData.role === "owner" && (
                <>
                  <div>
                    <Label htmlFor="phone">
                      전화번호 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="010-1234-5678"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shop_id">
                      매장 ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="shop_id"
                      name="shop_id"
                      type="text"
                      required
                      value={formData.shop_id}
                      onChange={(e) => handleChange("shop_id", e.target.value)}
                      placeholder="관리자에게 받은 매장 ID를 입력하세요"
                      className="mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      관리자가 문자로 전달한 UUID를 붙여넣기 해주세요
                    </p>

                    {/* 실시간 검증 결과 표시 */}
                    {formData.shop_id && (
                      <div className="mt-2">
                        {isValidatingShop ? (
                          <p className="text-sm text-gray-500">
                            매장 확인 중...
                          </p>
                        ) : shopValidation ? (
                          shopValidation.valid ? (
                            <div className="rounded-md bg-green-50 p-3">
                              <p className="text-sm font-medium text-green-800">
                                ✓ {shopValidation.name}
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                {shopValidation.address}
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-md bg-red-50 p-3">
                              <p className="text-sm font-medium text-red-800">
                                ✗ {shopValidation.error}
                              </p>
                            </div>
                          )
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="business_license">
                      사업자등록번호 (선택)
                    </Label>
                    <Input
                      id="business_license"
                      name="business_license"
                      type="text"
                      value={formData.business_license}
                      onChange={(e) =>
                        handleChange("business_license", e.target.value)
                      }
                      placeholder="123-45-67890"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="business_name">상호명 (선택)</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      type="text"
                      value={formData.business_name}
                      onChange={(e) =>
                        handleChange("business_name", e.target.value)
                      }
                      placeholder="가게 이름"
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="최소 6자 이상"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  placeholder="비밀번호를 다시 입력하세요"
                  className="mt-1"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "회원가입 중..." : "회원가입"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  로그인
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

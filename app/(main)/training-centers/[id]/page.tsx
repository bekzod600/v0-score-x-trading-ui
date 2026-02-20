"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  Phone,
  Send,
  Globe,
  CheckCircle,
  MessageCircle,
  Building,
  Calendar,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from "@/lib/user-context"
import { useToast } from "@/lib/toast-context"
import {
  getCenter,
  enrollCenter,
  unenrollCenter,
  rateCenter,
  type TrainingCenter,
} from "@/lib/services/training-centers-service"

function DetailSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Skeleton className="h-8 w-20 mb-4" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-28" />
          </div>
        </div>
      </div>
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  )
}

export default function TrainingCenterDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { token, isLoggedIn } = useUser()
  const { showToast } = useToast()

  const [center, setCenter] = useState<TrainingCenter | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [userRating, setUserRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [enrolling, setEnrolling] = useState(false)

  const [studentsModalOpen, setStudentsModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [studentSearch, setStudentSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const data = await getCenter(id, token)
        setCenter(data)
        setIsEnrolled(data.is_enrolled ?? false)
        setUserRating(data.user_rating ?? 0)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, token])

  const handleEnrollToggle = async () => {
    if (!isLoggedIn || !token) {
      router.push("/login")
      return
    }
    setEnrolling(true)
    try {
      const res = isEnrolled ? await unenrollCenter(token, id) : await enrollCenter(token, id)
      setIsEnrolled(res.enrolled)
      setCenter((prev) => (prev ? { ...prev, students_count: res.students_count } : prev))
      showToast("success", res.enrolled ? "Added to your studied centers!" : "Removed from studied centers")
    } catch {
      showToast("error", "Failed. Try again.")
    } finally {
      setEnrolling(false)
    }
  }

  const handleRate = async (newRating: number) => {
    if (!isLoggedIn || !token) {
      router.push("/login")
      return
    }
    try {
      const res = await rateCenter(token, id, newRating)
      setCenter((prev) =>
        prev ? { ...prev, rating: res.rating, rating_count: res.rating_count } : prev,
      )
      setUserRating(res.user_rating)
      showToast("success", "Rating submitted!")
    } catch {
      showToast("error", "Failed to rate. Try again.")
    }
  }

  if (loading) return <DetailSkeleton />

  if (notFound || !center) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <div className="text-center py-12">
          <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2">Center not found</h1>
          <p className="text-muted-foreground mb-4">This training center does not exist or is not available.</p>
          <Link href="/training-centers">
            <Button variant="outline">Back to Centers</Button>
          </Link>
        </div>
      </div>
    )
  }

  const filteredStudents = (center.students ?? []).filter((s) =>
    s.username.toLowerCase().includes(studentSearch.toLowerCase()),
  )

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Avatar className="h-24 w-24 rounded-xl shrink-0">
          <AvatarImage src={center.logo_url || undefined} alt={center.name} />
          <AvatarFallback className="rounded-xl text-2xl">
            <Building className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{center.name}</h1>
          {center.city && (
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{center.city}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="font-semibold text-lg">{Number(center.rating).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({center.rating_count} reviews)</span>
            </div>
            <Dialog open={studentsModalOpen} onOpenChange={setStudentsModalOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-sm hover:text-primary transition-colors">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{center.students_count} students</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Students ({center.students_count})</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="mb-4"
                />
                <div className="flex-1 overflow-y-auto space-y-2">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div key={student.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={student.avatar || undefined} />
                          <AvatarFallback>{student.username.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.username}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(student.enrolled_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No students found</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            {center.approved_at && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Approved {new Date(center.approved_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant={isEnrolled ? "secondary" : "default"}
          onClick={handleEnrollToggle}
          disabled={enrolling}
        >
          {enrolling ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          {!isLoggedIn
            ? "Login to mark as studied"
            : isEnrolled
              ? "You Studied Here"
              : "I Studied Here"}
        </Button>
        <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact {center.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {center.phone && (
                <a
                  href={`tel:${center.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{center.phone}</p>
                  </div>
                </a>
              )}
              {center.telegram && (
                <a
                  href={`https://t.me/${center.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
                >
                  <Send className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Telegram</p>
                    <p className="text-sm text-muted-foreground">{center.telegram}</p>
                  </div>
                </a>
              )}
              {center.website && (
                <a
                  href={center.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
                >
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-sm text-muted-foreground truncate">{center.website}</p>
                  </div>
                </a>
              )}
              {center.address && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{center.address}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rating Section */}
      {isLoggedIn && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">
              {userRating > 0 ? `Your rating: ${userRating}/5` : "Rate this center"}
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoverRating || userRating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="about">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {center.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="students" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {(center.students ?? []).length > 0 ? (
                <div className="space-y-3">
                  {(center.students ?? []).map((student) => (
                    <div key={student.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar || undefined} />
                        <AvatarFallback>{student.username.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{student.username}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(student.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No students yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {center.phone && (
                <a
                  href={`tel:${center.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{center.phone}</p>
                  </div>
                </a>
              )}
              {center.telegram && (
                <a
                  href={`https://t.me/${center.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
                >
                  <Send className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Telegram</p>
                    <p className="text-sm text-muted-foreground">{center.telegram}</p>
                  </div>
                </a>
              )}
              {center.website && (
                <a
                  href={center.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary transition-colors"
                >
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Website</p>
                    <p className="text-sm text-muted-foreground truncate">{center.website}</p>
                  </div>
                </a>
              )}
              {center.address && (
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{center.address}</p>
                  </div>
                </div>
              )}
              {!center.phone && !center.telegram && !center.website && !center.address && (
                <p className="text-center text-muted-foreground py-4">No contact information provided</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
